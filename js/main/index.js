$(document).ready(function () {

    function renderProducts() {
        getProducts()
            .done(products => {
                // featured items
                $('#featured-items').html(
                    products.filter((p) => p.featured).map(renderProductItem).join('')
                );

                // recommended items
                $('#recommended-item-carousel .carousel-inner').html(
                    `
                    <div class="item active">${products.filter((p) => p.recommended).splice(0, 3).map(renderProductCarouselItem).join('')}</div>
                    <div class="item">${products.filter((p) => p.recommended).splice(3, 6).map(renderProductCarouselItem).join('')}</div>
                    `
                );

            })
            .fail((error) => console.log('Error loading products'));
    };

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

    function renderProductCarouselItem(product) {
        return `
        <div class="col-sm-4">
            <div class="product-image-wrapper" style="height:365px;">
                <div class="single-products">
                    <div class="productinfo text-center">
                        <img style="width: 200px;" src="${product.images[0].src}" alt="${product.images[0].alt}" />
                        <h2>$${product.price}</h2>
                        <p>${product.name}</p>
                        <a href="#" class="btn btn-default add-to-cart" data-product-id="${product.id}"><i class="fa fa-shopping-cart"></i>Add to cart</a>
                    </div>
                </div>
            </div>
        </div>
    `};

    const renderFiltersBySubcategory = function () {
        return {
            currentCategory: null,
            categoriesWithProducts: [],
            init: function () {
                getCategories().done((categories) => {
                    getProducts().done((products) => {
                        // randomly select subcategories
                        categories.forEach((c) => {
                            let subcategory = c.subcategories[Math.floor(Math.random() * (c.subcategories.length - 0) + 0)];
                            let productsForSubcategory = products.filter((p) => subcategory.id === p.categoryId).slice(0, 3);
                            this.categoriesWithProducts.push(Object.assign({}, subcategory, { products: productsForSubcategory }));
                        });
                        this.currentCategory = this.categoriesWithProducts[0];
                        $('#category-tabs').html(
                            this.renderCategoryTabNav(this.categoriesWithProducts) + this.renderCategoryTabs(this.categoriesWithProducts)
                        );
                    })
                })
            },
            renderCategoryTabNav: function (categories) {
                return `
            <div class="col-sm-12">
                <ul class="nav nav-tabs">
                    ${categories.map((c) => this.renderCategoryTabNavItem(c)).join('')}
                </ul>
            </div>`
            },
            renderCategoryTabNavItem: function (category) { return `<li class="${this.currentCategory.id === category.id ? 'active' : ''}"><a href="#category_tab_${category.id}" data-toggle="tab">${category.name}</a></li>` },
            renderCategoryTabs: function (categories) { return `<div class="tab-content">${categories.map((c) => this.renderCategoryTab(c)).join('')}</div>` },
            renderCategoryTab: function (category) { return `<div class="tab-pane fade in ${this.currentCategory.id === category.id ? 'active' : ''}" id="category_tab_${category.id}"> ${category.products.map(this.renderCategoryTabItem).join('')}</div>`; },
            renderCategoryTabItem: function (product) {
                return `
            <div class="col-sm-4">
                <div class="product-image-wrapper">
                    <div class="single-products">
                        <div class="productinfo text-center">
                            <img src="${product.images[0].src}" alt="${product.images[0].alt}" />
                            <h2>$${product.price}</h2>
                            <p>${product.name}</p>
                            <a href="#" class="btn btn-default add-to-cart" data-product-id="${product.id}"><i class="fa fa-shopping-cart"></i>Add to cart</a>
                        </div>
                    </div>
                </div>
            </div>`;
            },
        }
    };

    renderProducts();
    renderFiltersBySubcategory().init();
});