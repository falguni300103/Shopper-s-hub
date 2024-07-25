class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex:this.queryStr.keyword,//ye islie taki jo b words wo keyword contain kre wo saare ajaye exactly same hona zaruri nhi aage piche aur letters b hoskte hain
                $options:"i",//case insensitive
            }
        }:{}
        //...keyword mtlb ki copy bnke jara warna by refernce pass hojata aur jo b changes krte sbmein ajata wo
        this.query=this.query.find({...keyword});//query jo Product.find() thi usko ab change krk iss new keyword jo regex se bnaye uske lie daldo
        return this;
    }

    filter(){
        const queryCopy={...this.queryStr};//ek copy bnado querystr ki taki user wali mein change na aaye

        //removing some fields for category

        const removeFields=["keyword","page","limit"];//kyuki ye saari field alg kaam k lie hai like filter and pagination

        removeFields.forEach((key)=>delete queryCopy[key]);//querystr se wo saari fields remove krdo filter wagera wali
        //Filter for price and rating
        let queryStr=JSON.stringify(queryCopy);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`)//kyuki mongodb objects mein samne $ lga hota hai
       /*(this.query is basically product.find)*/ this.query=this.query.find(JSON.parse(queryStr));//this.query.find mtlb product.find(category=laptop&&price=something range) ya jo b user ne dala hai kyuki ab querycopy mein bs category wali field bchi hai and price wali
        return this;
    }

    pagination(resultPerPage){
        const currentPage=Number(this.queryStr.page)||1;

        const skip= resultPerPage * (currentPage-1);//itne pagr skip honge jaise 2nd page pe hain to 5 skip hongi kyuki result perpage 5 hai

        this.query=this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

module.exports=ApiFeatures