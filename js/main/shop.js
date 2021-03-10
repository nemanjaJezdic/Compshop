$(document).ready(function () {
    let urlParams = new URLSearchParams(window.location.search);
    let categoryId = urlParams.get('categoryId');

    $('.price-range #sl2').slider();

    $(".price-range #sl2").on("slideStop", function (event) {
        loadProducts();
    });

    getProducts().done((products) => {
        let filteredProducts = products;

        if (categoryId) {
            filteredProducts = products.filter((p) => p.categoryId == categoryId);
        }

        $('#category-container').html(
            filteredProducts.map(renderProductItem).join('')
        );
    });

    function loadProducts() {
        getProducts().done((products) => {
            let filteredAndSortedProducts = products;

            if (categoryId) {
                filteredAndSortedProducts = products.filter((p) => p.categoryId == categoryId);
            }

            let range = $(".price-range #sl2").val() == '' ? [0, 3000] : $(".price-range #sl2").val().split(',');
            let sortField = $('#sort-by-container #sort-by-select').val();
            filteredAndSortedProducts = filteredAndSortedProducts
                .filter(p => p.price > range[0] && p.price < range[1])
                .sort(function (a, b) {
                    if ($('#sort-by-container input:checked').val() == 'asc') {
                        if (a[sortField] < b[sortField]) {
                            return -1;
                        }
                        if (a[sortField] > b[sortField]) {
                            return 1;
                        }
                    } else {
                        if (a[sortField] > b[sortField]) {
                            return -1;
                        }
                        if (a[sortField] < b[sortField]) {
                            return 1;
                        }
                    }
                });

            $('#category-container').html(
                filteredAndSortedProducts.map(renderProductItem).join('')
            );
        });
    };

    $('#sort-by-container #sort-by-select, #sort-by-container .checkbox-inline input[type=radio]').on('change', function (e) {
        if ($('#sort-by-container #sort-by-select').val() != '') {
            loadProducts();
        }
    });

    function renderProductItem(product) {
        return `
        <div class="col-sm-4">
            <div class="product-image-wrapper" style="height:365px;">
                <div class="single-products">
                    <div class="productinfo text-center">
                        <img style="width: 200px;" src="${product.images[0].src}" alt="${product.images[0].alt}" />
                        <h2>$${product.price}</h2>
                        <p>${product.name}</p>
                        <a href="#" class="btn btn-default add-to-cart" data-product-id="${product.id}" ><i class="fa fa-shopping-cart"></i>Add to cart</a>
                    </div>
                    <div class="product-overlay">
                        <div class="overlay-content">
                            <h2>$${product.price}</h2>
                            <p>${product.name}</p>
                            <a href="#" class="btn btn-default add-to-cart" data-product-id="${product.id}" ><i class="fa fa-shopping-cart"></i>Add to cart</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>`};
});
