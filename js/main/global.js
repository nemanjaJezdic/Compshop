function getProducts() {
    return $.ajax({
        dataType: 'json',
        url: '/Compshop/data/products.json'
    });
}

function getCategories() {
    return $.ajax({
        dataType: 'json',
        url: '/Compshop/data/categories.json',
    });
}

function getCart() {
    let defaultValues = { products: [] };

    try {
        let cart = JSON.parse(localStorage.getItem('cart'));
        return cart ? cart : defaultValues;
    } catch (e) {
        return defaultValues;
    }
};

function saveCart(cart) {
    return localStorage.setItem('cart', JSON.stringify(cart));
};

function addProductToCart(productId) {
    let cart = getCart();

    if (cart.products) {
        let existingProduct = cart.products.find((p) => p.id == productId);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.products.push({ id: productId, quantity: 1 });
        }
    } else {
        cart.products = [{ id: productId, quantity: 1 }];
    }

    saveCart(cart);
};

function removeProductFromCart(productId) {
    let cartJson = localStorage.getItem('cart');

    if (cartJson) {
        let cart = JSON.parse(cartJson);

        if (cart.products) {
            cart.products = cart.products.filter((p) => p != productId);
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }
};

$(document).ready(function () {

    // add to cart
    $('body').on('click', '.add-to-cart', function (e) {
        e.preventDefault();
        let productId = $(this).attr('data-product-id');

        addProductToCart(productId);

        let beforeHtml = $(this).html();
        $(this).html('<div class="loader"></div>');
        $(this).addClass('loading-add-to-cart');

        setTimeout(() => {
            $(this).html(beforeHtml);
            $(this).removeClass('loading-add-to-cart');
            $.toast({ text: 'Successfully added product to cart. <a href="/Compshop/checkout.html">Go to cart</a>', position: 'bottom-center' });
        }, 1500);
    });
    /*price range*/

    let RGBChange = function () {
        $('#RGB').css('background', 'rgb(' + r.getValue() + ',' + g.getValue() + ',' + b.getValue() + ')')
    };

    /*scroll to top*/
    $(function () {
        $.scrollUp({
            scrollName: 'scrollUp', // Element ID
            scrollDistance: 300, // Distance from top/bottom before showing element (px)
            scrollFrom: 'top', // 'top' or 'bottom'
            scrollSpeed: 300, // Speed back to top (ms)
            easingType: 'linear', // Scroll to top easing (see http://easings.net/)
            animation: 'fade', // Fade, slide, none
            animationSpeed: 200, // Animation in speed (ms)
            scrollTrigger: false, // Set a custom triggering element. Can be an HTML string or jQuery object
            //scrollTarget: false, // Set a custom target element for scrolling to the top
            scrollText: '<i class="fa fa-angle-up"></i>', // Text for element, can contain HTML
            scrollTitle: false, // Set a custom <a> title if required.
            scrollImg: false, // Set true to use image
            activeOverlay: false, // Set CSS color to display scrollUp active point, e.g '#00FFFF'
            zIndex: 2147483647 // Z-Index for the overlay
        });
    });

    function renderCategories() {
        getCategories()
            .done(categories => {
                // render on the side
                $('#categories').html(categories.map(renderCategoryItem).join(''));

                // render inside dropdown
                let categoriesForMenu = categories.reduce((accumulator, currentValue) => currentValue.subcategories.concat(accumulator), []).map(renderCategoryMenuItem);
                $('#categories-menu').html(categoriesForMenu.join(''));
                $('.categories-footer').html(categoriesForMenu.slice(0, 5).join(''));
            })
            .fail((error) => console.log('Error loading categories'));
    };

    function renderCategoryItem(category) {
        let subcategories = '';
        let hasSubscategories = category.subcategories && category.subcategories.length > 0;

        if (hasSubscategories) {
            subcategories = `
                    <div id="accordian-${category.id}" class="panel-collapse collapse">
                        <div class="panel-body">
                            <ul>
                                ${category.subcategories.map((c) => `<li id="${c.id}" ><a href="/Compshop/shop.html?categoryId=${c.id}">${c.name}</a></li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
        }

        return `
            <div class="panel panel-default">
                <div id="category-${category.id}" class="panel-heading">
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#accordian" href="#accordian-${category.id}">
                            ${hasSubscategories ? '<span class="badge pull-right"><i class="fa fa-plus"></i></span>' : ''}
                            ${category.name}
                        </a>
                    </h4>
                </div>
                ${subcategories}
            </div>`;
    };

    function renderCategoryMenuItem(category) { return `<li><a href="shop.html?categoryId=${category.id}">${category.name}</a></li>` };
    renderCategories();
});