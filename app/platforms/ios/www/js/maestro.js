angular.module('starter')
.service("Maestro", ['$q', '$http', '$constants', 
        function ($q, $http, $constants) {
            var self = this;

            //Request Url and method
            var request = {
                url: $constants.restApiUrl,
        
                headers: {
                    "Content-Type": 'application/json'
                },
                params: {
                    'appId': $constants.appId,
                    'appSecret': $constants.appSecret
                
                }
            };

            

return {

            //Service Function to get products by category
            $getCategories : function () {

              return $http.get( request.url + '/list-categories.php', {
                    params: request.params,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
                
            },

            //Service Function to get products by category
            $getProductsByCategory : function (categoryId) {

                var parameters = angular.copy(request.params);
                if(categoryId){
                    parameters.category = categoryId;
                }

              return $http.get( request.url + '/list-products.php', {
                    params: parameters,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
                
            },
            //Service Function to get products by category
            $getAllProducts : function () {

              return $http.get( request.url + '/list-products.php', {
                    params: request.params,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
                
            },
            
            //Service Function to get products by id
            $getProductsById : function (productId) {
              
                var productParams = request.params;
                productParams.productId = productId;

                return $http.get( request.url + '/single-product.php', {
                    params: productParams,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })

            },
            //Service Function to get products by id
            $createOrder : function (orderData) {
                console.log(orderData);

                

                return $http.post( request.url + '/create-order.php',orderData, {
                    params: request.params,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
            },
            //Service Function to get products by id
            $getOrderById : function (orderId) {

                var orderParams = request.params;
                orderParams.orderId = orderId;

                return $http.get( request.url + '/get-order.php', {
                    params: orderParams,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
            },
            //Service Function to get order by customerid
            $getOrderByCustomer : function (customerId) {

                var orderParams = request.params;
                orderParams.customer = customerId;

                return $http.get( request.url + '/list-orders.php', {
                    params: orderParams,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
            },
            //Service Function to update order
            $updateOrder : function (orderData) {
               

                return $http.post( request.url + '/update-order.php',orderData, {
                    params: request.params,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
            },
            //get customer by Id
            $getCustomerById : function (userId) {

                var customerParams = angular.copy(request.params);
                customerParams.userId = userId;

                return $http.post( request.url + '/get-customer.php',{}, {
                    params: customerParams,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
            },
            //update customer
            $updateCustomer : function (data) {

                var customerUpdateParams = angular.copy(request.params);
                customerUpdateParams.userId = data.id;

                return $http.post( request.url + '/update-customer.php', data, {
                    params: customerUpdateParams,
                    headers: {
                        "Content-Type": 'application/json'
                    }
                    
                })
            },
}




        }
    ])
