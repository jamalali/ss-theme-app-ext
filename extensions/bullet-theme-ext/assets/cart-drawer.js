(function() {

    $(document).on('cart.requestComplete', (event, cart) => {
        renderCartContents(cart)
        openCartDrawer()
    });

    const cartDrawer = document.getElementById('ss-cart-drawer')
    const cartDrawerBody = cartDrawer.querySelector('.body')

    const openCartDrawer = () => { document.body.classList.add('cart-drawer-open') }
    const closeCartDrawer = () => { document.body.classList.remove('cart-drawer-open') }

    const getCart = () => {
        fetch(window.Shopify.routes.root + 'cart.js')
            .then(response => response.json())
            .then(data => {
                renderCartContents(data)
            })
    }

    const renderCartContents = (data) => {
        console.log(data)
        console.log('render now')

        if (data.items.length > 0) {
            cartDrawer.classList.remove('empty')
        }

        data.items.forEach(item => {
            const line = document.createElement('div')
            line.classList.add('line-item')

            const price = item.line_price / 100

            line.textContent = `${item.product_title} - Qty: ${item.quantity} - $${price.toFixed(2)}`

            cartDrawerBody.appendChild(line)
        })
    }

    window.addEventListener('load', () => {
        const headerGrid = document.getElementById('header-grid')
        const cartLink = headerGrid.querySelector('.carto')

        const cartDrawerClose = document.getElementById('close-cart-drawer')
        cartDrawerClose.addEventListener('click', closeCartDrawer)

        const overlay = document.getElementById('ss-overlay')
        overlay.addEventListener('click', closeCartDrawer)
        
        const cartLinkClone = cartLink.cloneNode(true);
        cartLink.parentNode.replaceChild(cartLinkClone, cartLink)
        cartLinkClone.addEventListener('click', openCartDrawer)

        getCart()
    })
})()