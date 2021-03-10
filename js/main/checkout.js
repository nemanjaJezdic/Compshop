$(document).ready(function () {

    const firstNameAndLastNameRegex = /^[A-Z][a-z]+$/;
    const emailRegex = /\S+@\S+\.\S+/;
    const addressRegex = /^[A-z\d\s\.]+$/;
    const zipRegex = /^[0-9]{5}$/;
    const phoneRegex = /\+[0-9]{10,12}$/;

    const checkoutFormValidationRules = {
        firstname: {
            regex: firstNameAndLastNameRegex,
            message: 'Is Required and first letter must be uppercase and the rest lowercase'
        },
        lastname: {
            regex: firstNameAndLastNameRegex,
            message: 'Is Required and first letter must be uppercase and the rest lowercase'
        },
        email: {
            regex: emailRegex,
            message: 'Is Required or in invalid format'
        },
        address: {
            regex: addressRegex,
            message: 'Is Required, no special characters except .(dot)'
        },
        zip: {
            regex: zipRegex,
            message: 'Only numbers, Exactly five'
        },
        phone: {
            regex: phoneRegex,
            message: 'Only numbers. Starting with +381, Exactly nine'
        },
    };

    $('.submit-checkout').on('click', function (e) {
        e.preventDefault();

        const billingInfoFormData = $('.billing-info-form').serializeArray().reduce((obj, f) => { obj[f.name] = f.value; return obj; }, {});
        const shippingInfoFormData = $('.shipping-info-form').serializeArray().reduce((obj, f) => { obj[f.name] = f.value; return obj; }, {});

        const billingInfoFormErrors = validateCheckoutForm(billingInfoFormData);
        const shippingInfoFormErrors = validateCheckoutForm(shippingInfoFormData);

        // show errors
        renderErrors($('.billing-info-form'), billingInfoFormErrors);
        renderErrors($('.shipping-info-form'), shippingInfoFormErrors);

        if ($.isEmptyObject(billingInfoFormErrors) && $.isEmptyObject(shippingInfoFormErrors)) {
            $('#myModal').modal('show');
            $('.billing-info-form').get(0).reset();
            $('.shipping-info-form').get(0).reset();

            let cart = getCart();
            cart.products = [];
            saveCart(cart);
        }
    });

    function validateCheckoutForm(data) {
        const errors = {};

        $.each(data, (fieldName, fieldValue) => {
            if (checkoutFormValidationRules[fieldName]) {
                if (!checkoutFormValidationRules[fieldName].regex.test(fieldValue)) {
                    errors[fieldName] = checkoutFormValidationRules[fieldName].message;
                }
            }
        });

        return errors;
    }

    function renderErrors(form, errors) {

        // clear existing errors
        $.each($(form).find('input, select'), function (i, element) {
            $(element).parent().removeClass('has-error');
            $(element).parent().find('.help-block').html('');
        });

        // render errors
        if (!$.isEmptyObject(errors)) {
            $.each(errors, function (fieldName, errorMessage) {
                $(form).find(`input[name=${fieldName}]`).parent().addClass('has-error');
                $(form).find(`input[name=${fieldName}]`).parent().find('.help-block').html(errorMessage);
            });
        }
    };

    $('body').on('click', '.cart_quantity_up', function (e) {
        e.preventDefault();
        const productId = $(this).attr('data-product-id');
        let cart = getCart();
        cart.products = cart.products.map((p) => {
            if (p.id == productId) {
                p.quantity += 1;
            }
            return p;
        });
        saveCart(cart);
        renderCart();
    });

    $('body').on('click', '.cart_quantity_down', function (e) {
        e.preventDefault();
        const productId = $(this).attr('data-product-id');
        let cart = getCart();
        cart.products = cart.products.map((p) => {
            if (p.id == productId) {
                p.quantity -= 1;
            }
            return p;
        }).filter((p) => p.quantity > 0);
        saveCart(cart);
        renderCart();
    });

    $('body').on('click', '.cart_quantity_delete', function (e) {
        e.preventDefault();
        const productId = $(this).attr('data-product-id');
        let cart = getCart();
        cart.products = cart.products.filter((p) => p.id != productId);
        saveCart(cart);
        renderCart();
    });

    function renderCart() {
        getProducts().done((products) => {
            const cart = getCart();

            if (!cart || !cart.products || cart.products.length <= 0) {
                $('#cart_items .cart-table > tbody').html(renderCartEmpty());
                $('.submit-checkout').addClass('disabled');
                return;
            }

            $('.submit-checkout').removeClass('disabled');

            const productsInCart = products
                .filter((p) => cart
                    .products
                    .find(pr => p.id == pr.id) !== undefined)
                .map((p) => {
                    const foundProduct = cart.products.find((pr) => p.id == pr.id);
                    if (foundProduct) {
                        p.quantity = foundProduct.quantity;
                    }
                    return p;
                });

            const cartInfo = {
                subtotal: productsInCart.reduce((subtotal, p,) => subtotal += p.price * p.quantity, 0),
                total: productsInCart.reduce((subtotal, p,) => subtotal += p.price * p.quantity, 0),
            };

            $('#cart_items .cart-table > tbody').html(productsInCart.map(renderCartItem).join(''));
            $('#cart_items .cart-table > tbody').append(renderCartInfo(cartInfo));
        });

    };

    function renderCartItem(product) {
        return `
    <tr>
        <td class="">
            <a href=""><img style="width:100px; padding:10px;"src="${product.images[0].src}" alt="${product.images[0].alt}"></a>
        </td>
        <td class="cart_description">
            <p>${product.name}</p>
            <p>Web ID: ${product.webId}</p>
        </td>
        <td class="cart_price">
            <p>$${Number.parseFloat(product.price).toFixed(2)}</p>
        </td>
        <td class="cart_quantity">
            <div class="cart_quantity_button">
                <a class="cart_quantity_up" href="" data-product-id="${product.id}"> + </a>
                <input id="cart_quantity_input_${product.id}" class="cart_quantity_input" type="text" name="quantity" value="${product.quantity}" autocomplete="off" size="2">
                <a class="cart_quantity_down" href="" data-product-id="${product.id}"> - </a>
            </div>
        </td>
        <td class="cart_total">
            <p class="cart_total_price">$${Number.parseFloat(product.quantity * product.price).toFixed(2)}</p>
        </td>
        <td class="cart_delete">
            <a class="cart_quantity_delete" href="" data-product-id="${product.id}" ><i class="fa fa-times"></i></a>
        </td>
    </tr>`};


    function renderCartEmpty() {
        return `
    <tr>
        <td colspan="6" class="text-center">
            Cart empty. Please add products to cart...
        </td>
    </tr>`};

    function renderCartInfo(data) {
        return `
    <tr>
        <td colspan="4">&nbsp;</td>
        <td colspan="2">
            <table class="table table-condensed total-result">
                <tr>
                    <td>Cart Sub Total</td>
                    <td>$${Number.parseFloat(data.subtotal).toFixed(2)}</td>
                </tr>
                <tr class="shipping-cost">
                    <td>Shipping Cost</td>
                    <td>Free</td>
                </tr>
                <tr>
                    <td>Total</td>
                    <td><span>$${Number.parseFloat(data.total).toFixed(2)}</span></td>
                </tr>
            </table>
        </td>
    </tr>
    `};

    renderCart();
});

