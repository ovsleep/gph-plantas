//----------------------------------------------------------------
// shopping cart
//
function shoppingCart(cartName) {
    this.cartName = cartName;
    this.clearCart = false;
    this.checkoutParameters = {};
    this.items = [];

    // load items from local storage when initializing
    this.loadItems();

    // save items to local storage when unloading
    var self = this;
    $(window).unload(function () {
        if (self.clearCart) {
            self.clearItems();
        }
        self.saveItems();
        self.clearCart = false;
    });
}

// load items from local storage
shoppingCart.prototype.loadItems = function () {
    var items = localStorage != null ? localStorage[this.cartName + "_items"] : null;
    if (items != null && JSON != null) {
        try {
            var items = JSON.parse(items);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item.id != null && item.name != null && item.price != null && item.quantity != null && item.image != null) {
                    item = new cartItem(item.product, item.unit, item.quantity, item.comment);
                    this.items.push(item);
                }
            }
        }
        catch (err) {
            // ignore errors while loading...
        }
    }
}

// save items to local storage
shoppingCart.prototype.saveItems = function () {
    if (localStorage != null && JSON != null) {
        localStorage[this.cartName + "_items"] = JSON.stringify(this.items);
    }
}

// adds an item to the cart
shoppingCart.prototype.addItem = function (product, selectedUnit, quantity, comment) {
    quantity = this.toNumber(quantity);
    if (quantity != 0) {

        // update quantity for existing item
        var found = false;
        for (var i = 0; i < this.items.length && !found; i++) {
            var item = this.items[i];
            if (item.id == product._id && item.unit == selectedUnit) {
                found = true;
                item.quantity = this.toNumber(item.quantity + quantity);
                item.comment = comment;
                item.unit = selectedUnit;

                if (item.quantity <= 0) {
                    this.items.splice(i, 1);
                }
            }
        }

        // new item, add now
        if (!found) {
            var item = new cartItem(product, selectedUnit, quantity, comment);
            this.items.push(item);
        }

        // save changes
        this.saveItems();
    }
}

// removes an item from the cart
shoppingCart.prototype.removeItem = function (id) {
    var found = false;
    for (var i = 0; i < this.items.length && !found; i++) {
        var item = this.items[i];
        if (item.id == id) {
            found = true;
        }
    }

    if (found) {
        this.items.splice(i - 1, 1);
        this.saveItems();
    }
}

// get the total price for all items currently in the cart
shoppingCart.prototype.getTotalPrice = function (id) {
    var total = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (id == null || item.id == id) {
            total += this.toNumber(item.quantity * item.price);
        }
    }
    return total;
}

// get the total price for all items currently in the cart
shoppingCart.prototype.getTotalCount = function (id) {
    var count = 0;
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (id == null || item.id == id) {
            count += 1;
        }
    }
    return count;
}

// clear the cart
shoppingCart.prototype.clearItems = function () {
    this.items = [];
    this.saveItems();
}

// check out
shoppingCart.prototype.checkout = function (serviceName, clearCart) {
    alert('checkout');
}


// utility methods
shoppingCart.prototype.addFormFields = function (form, data) {
    if (data != null) {
        $.each(data, function (name, value) {
            if (value != null) {
                var input = $("<input></input>").attr("type", "hidden").attr("name", name).val(value);
                form.append(input);
            }
        });
    }
}
shoppingCart.prototype.toNumber = function (value) {
    value = value * 1;
    return isNaN(value) ? 0 : value;
}

//----------------------------------------------------------------
// checkout parameters (one per supported payment service)
//
function checkoutParameters(serviceName, merchantID, options) {
    this.serviceName = serviceName;
    this.merchantID = merchantID;
    this.options = options;
}

//----------------------------------------------------------------
// items in the cart
//
function cartItem(product, selectedUnit, quantity, comment) {
    this.product = product;
    this.id = product._id;
    this.image = product.image;
    this.name = product.name;
    this.quantity = quantity * 1;
    this.unit = selectedUnit;
    this.comment = comment;

    //price is calculated different depending on the selected unit
    if (this.unit == product.unit) {
        this.price = product.price * 1;
    }
    else if (this.unit == 'Unidad') {
        this.price = product.price * 1 * product.unitWeight;
        this.aproxPrice = true;
    }
}

