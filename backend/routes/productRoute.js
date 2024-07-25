const express=require("express");
const { getallProducts,createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, deleteReview, getProductReviews, getAdminProducts } = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles} = require("../middleware/auth");

const router=express.Router();

console.log("products cal;l; reached router");

router.route("/products").get(getallProducts)
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);
router.route("/admin/product/new").post(isAuthenticatedUser,authorizeRoles("admin"),createProduct)
router.route("/admin/product/:id").put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct);
router.route("/product/:id").get(getProductDetails);
router.route("/review").put(isAuthenticatedUser,createProductReview);
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReview);



module.exports=router;