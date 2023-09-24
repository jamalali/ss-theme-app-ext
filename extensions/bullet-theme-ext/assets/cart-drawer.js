Vue.component('cart-drawer-deactivator', {
  template: '<a v-on:click="$emit(\'close-cart-drawer\')" class="cart-drawer-deactivator">&#x2715;</a>'
})

Vue.component('line-item', {
  props: [
    'item',
    'num'
  ],
  computed: {
    itemPrice: function () {
      const price = this.item.line_price / 100
      return '$' + price.toFixed(2)
    },
    removeLink: function () {
      return `/cart/change?line=${this.num}&quantity=0`
    },
    subTitle: function () {
      return `${this.item.vendor} | ${this.item.variant_title}`
    }
  },
  methods: {
    handleChangeQty: function (e) {
      this.$emit('update-qty', {
        'id': this.item.key,
        'quantity': e.target.value
      })
    },
    handleRemove: function () {
      this.$emit('remove', this.item.key)
    }
  },
  template: `<li class="line-item">
      <img :src="item.image" :alt="item.title" class="item-img" />
      <div class="info">
        <p v-text="item.product_title" class="title"></p>
        <p v-text="subTitle" class="sub-title"></p>
        <p v-text="itemPrice" class="price"></p>
        <div class="actions">
          <a :href="removeLink" class="remove-link" @click.prevent="handleRemove">Remove</a>
          <select :value="this.item.quantity" class="qty-selector" @change="handleChangeQty">
            <option v-for="n in 10" v-text="n"></option>
          </select>
        </div>
      </div>
    </li>`
})

Vue.component('cart-summary', {
  props: [
    'cart'
  ],
  methods: {
    priceWithCurrency: function (price) {
      price = price / 100
      return '$' + price.toFixed(2)
    }
  },
  computed: {
    itemsSummary: function () {
      return `<span>${this.cart.item_count} product(s)</span>
        <span>${this.priceWithCurrency(this.cart.items_subtotal_price)}</span>`
    },
    cartSummary: function () {
      return `<span>Sub Total</span>
        <span>${this.priceWithCurrency(this.cart.total_price)}</span>`
    }
  },
  template: `<div>
    <div>
      <p v-html="itemsSummary" class="items-summary-line"></p>
      <p v-html="cartSummary" class="cart-summary-line"></p>
    </div>
  </div>`
})

const cartDrawer = new Vue({
  el: '#ss-cart-drawer',
  data() {
    return {
      cart: null,
      items: [],
      loading: false,
      active: false
    }
  },

  created: function () {
    this.initEventListeners()
    this.getCart()
  },

  watch: {
    active: function (isActive) {
      if (isActive) {
        document.body.classList.add('cart-drawer-open')
      } else {
        document.body.classList.remove('cart-drawer-open')
      }
    }
  },

  methods: {
    openCartDrawer: function () { this.active = true },
    closeCartDrawer: function () { this.active = false },

    initEventListeners: function () {
      const headerGrid = document.getElementById('header-grid')
      const cartLink = headerGrid.querySelector('.carto')

      const overlay = document.getElementById('ss-overlay')
      overlay.addEventListener('click', this.closeCartDrawer)

      const cartLinkClone = cartLink.cloneNode(true)
      cartLink.parentNode.replaceChild(cartLinkClone, cartLink)
      cartLinkClone.addEventListener('click', this.openCartDrawer)

      $(document).on('cart.requestComplete', (event, cart) => {
        this.cart = cart
        this.items = cart.items
        this.openCartDrawer()
      })
    },

    updateCounter: function (count) {
      document.getElementById('counter').setAttribute('data-count', count)
    },

    removeLineItem: function (key) {
      if (!key) {
        return false
      }

      this.loading = true

      const params = new URLSearchParams()
      params.append('id', key)
      params.append('quantity', 0)

      fetch(window.Shopify.routes.root + 'cart/change.js', {
        method: "POST",
        body: params
      })
      .then(response => response.json())
      .then(cart => {
        this.cart = cart
        this.items = cart.items
        this.updateCounter(cart.item_count)
        this.loading = false
      })
    },

    updateLineQty: function (data) {
      if (!data.id || !data.quantity) {
        return false
      }

      this.loading = true

      const params = new URLSearchParams()
      params.append('id', data.id)
      params.append('quantity', data.quantity)

      fetch(window.Shopify.routes.root + 'cart/change.js', {
        method: "POST",
        body: params
      })
      .then(response => response.json())
      .then(cart => {
        this.cart = cart
        this.items = cart.items
        this.updateCounter(cart.item_count)
        this.loading = false
      })
    },

    getCart: function () {
      fetch(window.Shopify.routes.root + 'cart.js')
        .then(response => response.json())
        .then(cart => {
          console.log(cart)
          this.cart = cart
          this.items = cart.items
        })
    },

    getLineItemHtml: function(item) {
      return item.title
    }
  }
})