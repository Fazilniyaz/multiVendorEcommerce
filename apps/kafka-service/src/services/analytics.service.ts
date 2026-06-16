
import prisma from "@multi-vendor-ecommerce/prisma";

export const updateUserAnalytics = async (event: any) => {
    console.log("Updating analytics for event:", event);
    
    // Validation: Ensure required fields exist
    if (!event.userId || !event.productId) {
        console.warn("Missing userId or productId in event:", event);
        return;
    }
try{
     const exisitngData = await prisma.userAnalytics.findUnique({
        where : {
            userId : event.userId
        },
        select : {
            actions : true
        }
     })


     let updatedActions:any = exisitngData?.actions || [];

     const actionExists = updatedActions.some((a:any) => a.productId === event.productId && a.action === event.action);

     console.log("Current actions in DB:", JSON.stringify(updatedActions));
     console.log("Event data:", { productId: event.productId, action: event.action });
     console.log("Action already exists:", actionExists);

     //Always store 'product_view' events, even if they already exist, to track multiple views of the same product
        if (event.action === "product_view") {
            updatedActions.push({
                productId: event?.productId,
                shopId : event?.shopId,
                action: "product_view",
                timestamp: new Date(),
            })
        }

        else if(["add_to_wishlist", "add_to_cart"].includes(event.action) && !actionExists){
            console.log("Addingggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg" , event.action)
            updatedActions.push({
                productId: event?.productId,
                shopId : event?.shopId,
                action: event?.action,
                timestamp: new Date(),
            })  
        }

        //removing add_to_cart when 'remove_from_cart' is triggered
        else if(event.action === "remove_from_cart"){
            console.log("BEFORE FILTER - updatedActions:", JSON.stringify(updatedActions));
            console.log("FILTER CRITERIA - productId:", event.productId, "looking for action: add_to_cart");
            const productIdString = String(event.productId);
            updatedActions = updatedActions.filter((entry:any) => !(String(entry.productId) === productIdString && entry.action === "add_to_cart"))
            console.log("AFTER FILTER - updatedActions:", JSON.stringify(updatedActions));
        }

        //removing add_to_wishlist when 'remove_from_wishlist' is triggered
        else if(event.action === "remove_from_wishlist"){
            console.log("BEFORE FILTER - updatedActions:", JSON.stringify(updatedActions));
            console.log("FILTER CRITERIA - productId:", event.productId, "looking for action: add_to_wishlist");
            const productIdString = String(event.productId);
            updatedActions = updatedActions.filter((entry:any) => !(String(entry.productId) === productIdString && entry.action === "add_to_wishlist"))
            console.log("AFTER FILTER - updatedActions:", JSON.stringify(updatedActions));
        }

        //keep only the last 100 actions to prevent storage bloat
        if(updatedActions.length > 100){
            updatedActions = updatedActions.slice(updatedActions.length - 100);
        }

        const extraFields : Record<string, any> = {};

        if(event.country){
            extraFields.country = event?.country;
        }

        if(event.city){
            extraFields.city = event?.city;
        }   

        if(event.device){
            extraFields.device = event?.device;
        }


        console.log("Updated actions for user:", updatedActions);

        //update or create the user analytics record
        try {
            const result = await prisma.userAnalytics.upsert({
                where : {
                    userId : event.userId
                },
                update : {
                    lastVisited : new Date(),
                    actions : updatedActions,
                    ...extraFields
                },
                create : {
                    userId : event.userId,
                    lastVisited : new Date(),
                    actions : updatedActions,
                    ...extraFields
                }
            })
            console.log("User analytics updated successfully:", result);
        } catch (dbError) {
            console.error("Database error during upsert:", dbError);
            throw dbError;
        }



        console.log("User analytics updated for user:", event.userId);

        //Also update product Analytics
        await updateProductAnalytics(event);


    }catch(error){
        console.error("Error in updateUserAnalytics:", error);


}

}

export const updateProductAnalytics = async (event: any) => {

    console.log("Updating product analytics for event:", event);

    try{

        if (!event.productId || !event.action) return; // Basic validation

        //Define update field dynamically.

        const updatedFields : any = {};

        if(event.action === "product_view"){
            updatedFields.views = {
                increment : 1
            }
        }

        else if(event.action === "add_to_cart"){
            updatedFields.addedToCart = {
                increment : 1
            }
        }

            else if(event.action === "remove_from_cart"){
                updatedFields.removedFromCart = {
                    decrement : 1
                }
            }

        else if(event.action === "add_to_wishlist"){
            updatedFields.addedToWishlist = {
                increment : 1
            }
        }

        else if (event.action === "remove_from_wishlist"){
            updatedFields.removedFromWishlist = {
                decrement : 1
            }
        }

        else if(event.action === "purchase"){
            updatedFields.purchases = {
                increment : 1
            }
        }

        console.log("Updated fields for product analytics:", updatedFields);

        //Update or Create product analytics Asynchronously, we don't want to block user analytics update for product analytics update.
        await prisma.productAnalytics.upsert({
            where : {
                productId : event.productId
            },
            update : {
                lastViewedAt : new Date(),
                ...updatedFields,   
            },
            create : {
                productId       : event.productId,
                shopId          : event.shopId || null,
                views           : event.action === "product_view"       ? 1 : 0,
                addedToCart     : event.action === "add_to_cart"        ? 1 : 0,
                removedFromCart : event.action === "remove_from_cart"   ? 1 : 0,
                addedToWishlist     : event.action === "add_to_wishlist"    ? 1 : 0,
                removedFromWishlist : event.action === "remove_from_wishlist" ? 1 : 0,
                purchases       : event.action === "purchase"            ? 1 : 0,
                lastViewedAt    : new Date(),
            }
        })

        console.log("Product analytics updated for product:", event.productId);
                

    }catch(error){
        console.error("Error in updateProductAnalytics:", error);
    }
}