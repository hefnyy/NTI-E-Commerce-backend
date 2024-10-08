import {Schema,model} from "mongoose";
import { Reviews } from "../interfaces/reviews";
import productsModel from "./productsModel";



const reviewsSchema: Schema = new Schema<Reviews>({
    comment: {type: String, required: true, trim:true},
    rating:{type: Number,requied:true,min:1,max:5},
    user:{type:Schema.Types.ObjectId,required:true,ref:'users'},
    product:{type:Schema.Types.ObjectId,required:true,ref:'products'}
    
 },{timestamps:true});

 reviewsSchema.statics.calcRatingAvgAndQuantity = async function (productId) {
    const result = await this.aggregate([
      { $match: { product: productId } },
      { $group: { _id: 'product', ratingAvg: { $avg: '$rating' }, ratingCounts: { $sum: 1 } } }
      
    ]);
     //console.log(result);
    if (result.length > 0) {
      await productsModel.findByIdAndUpdate(productId, {
        ratingAvg: result[0].ratingAvg,
        ratingCount: result[0].ratingCounts
      })
    } else {
      await productsModel.findByIdAndUpdate(productId, {
        ratingAvg: 0,
        ratingCount: 0
      })
    }
  }; 

  reviewsSchema.post<Reviews>('save', async function () { 
    await (this.constructor as any).calcRatingAvgAndQuantity(this.product) 
})

reviewsSchema.post<Reviews>('findOneAndDelete', async function(doc) {
  const review = doc as unknown as Reviews; 
  if (review.product) {
      await (review.constructor as any).calcRatingAvgAndQuantity(review.product);
  }
});

 reviewsSchema.pre<Reviews>(/^find/, function (next) {
    this.populate({ path: 'user', select: 'name profileImage' })
    
    next()
  })
reviewsSchema.pre<Reviews>('find', function (next) {
  this.populate({ path: 'product', select: 'name cover' })
  next()
})

export default model<Reviews>('reviews',reviewsSchema)