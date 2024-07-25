const Product=require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const ApiFeatures = require("../utils/apifeatures");
const cloudinary=require("cloudinary");


//create product--Admin
exports.createProduct=catchAsyncErrors(async(req,res,next)=>{
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;

    req.body.user=req.user.id

    const product=await Product.create(req.body);

    res.status(201).json({
        success:true,
        product,
    })
})


//Get all products
exports.getallProducts=catchAsyncErrors(async(req,res,next)=>{
   console.log("Products call reached contolrrer");
    const resultPerPage=5;

    const temp=new ApiFeatures(Product.find(),req.query).search().filter();
    const apiFeature=new ApiFeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);

    const products=await apiFeature.query;
    //initially query mein all products rhnge fir uspe filter(search) lgega to us hisab se ayenge
    //pehle jb user login krega to querystr khali hoga islie .search nhi chlega sidha sab products dikhega then search filter lgne pe filtered dikhenge
    const tmp=await temp.query;
    const productsCount=tmp.length;
    
    res.status(200).json(
        {
        success:true,
        products,
        productsCount,
        resultPerPage,
        }
        )
})

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});


//Get a single product details
exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }

    res.status(200).json({
        success:true,
        product,
    })


})

//Update a Product--Admin
exports.updateProduct=catchAsyncErrors(async(req,res,next)=>{
    let product=await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }

    //Images start here
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    if(images!==undefined){

    //Deleting images from cloudinary
    for(let i=0;i<product.images.length;i++){
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    req.body.images=imagesLinks;
    }


    product=await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    })
})

//Delete Product--Admin
exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id);

    if(!product){
        return res.status(500).json({
            success:false,
            message:"Product not found"
        })
    }

    //Deleting images from cloudinary
    for(let i=0;i<product.images.length;i++){
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success:true,
        message:"Product Deleted Successfully"
    })
})

//Create New Review or Update the review

exports.createProductReview=catchAsyncErrors(async(req,res,next)=>{

    const{rating,comment,productId}=req.body;
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    };

    const product=await Product.findById(productId);
    const isReviewed=product.reviews.find(//agr already reviewd hai to check kro id k through agr milgya mtlb review update krna hai
        (rev)=>rev.user.toString()===req.user._id.toString()
    );

    if(isReviewed){
        product.reviews.forEach((rev) => {//har review ko update krdo jahan b user match ho
            if(rev.user.toString()===req.user.toString()){
                (rev.rating=rating),(rev.comment=comment)
            }  
        });

    }else{//warna reviews ki array mein push krdo aur length update krdo taki rating nikal paye average 
        product.reviews.push(review);
        product.numOfReviews=product.reviews.length
    }

    let avg=0;
    product.reviews.forEach((rev)=>{
        avg+=rev.rating
    })
    product.ratings=avg/product.reviews.length

    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
    })
})

//Get all Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);//product find kro jiska review chahiye
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,//reviews ki array
    });
  });

  // Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
  
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()//uss ek review chorke baki sb ko le aao
    );
  
    let avg = 0;
  
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
  
    let ratings = 0;
  
    if (reviews.length === 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
  
    const numOfReviews = reviews.length;
  
    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  
    res.status(200).json({
      success: true,
    });
  });