import { PrismaClient } from "../../../../generated/prisma"

const prisma = new PrismaClient()

const initializeSiteConfig = async () => {
    try {
        const exisitngConfig = await prisma.site_config.findFirst()
        if (!exisitngConfig) {
            await prisma.site_config.create({
                data: {
                    categories: [
                        "Electronics",
                        "Fashion",
                        "Home & Kitchen",
                        "Beauty & Personal Care",
                        "Sports & Fitness",
                        "Toys & Hobbies",
                        "Accessories",
                        "Books & Media",
                        "Automotive",
                        "Pet Supplies",
                        "Groceries",
                        "Health & Wellness",
                        "Baby Products",
                        "Office & Stationery",
                        "Industrial & Tools",
                        "Software & Digital",
                        "Services"
                    ],

                    subCategories: {
                        "Electronics": ["Mobiles", "Laptops", "Tablets", "Audio", "Cameras", "Wearables", "Accessories", "Smart Home"],

                        "Fashion": ["Men", "Women", "Kids", "Footwear", "Innerwear", "Ethnic Wear"],

                        "Home & Kitchen": ["Furniture", "Decor", "Kitchenware", "Appliances", "Bedding", "Lighting"],

                        "Beauty & Personal Care": ["Skincare", "Makeup", "Haircare", "Fragrance", "Grooming"],

                        "Sports & Fitness": ["Equipment", "Accessories", "Clothing", "Nutrition"],

                        "Toys & Hobbies": ["Toys", "Board Games", "DIY Kits", "Collectibles"],

                        "Accessories": ["Jewellery", "Bags", "Watches", "Sunglasses"],

                        "Books & Media": ["Books", "Magazines", "Movies", "Music", "Digital Content"],

                        "Automotive": ["Car", "Bike", "Accessories", "Spare Parts", "Oils"],

                        "Pet Supplies": ["Food", "Accessories", "Healthcare"],

                        "Groceries": ["Fruits", "Vegetables", "Snacks", "Beverages", "Staples"],

                        "Health & Wellness": ["Medicines", "Supplements", "Devices", "Personal Care"],

                        "Baby Products": ["Clothing", "Diapers", "Feeding", "Toys", "Care"],

                        "Office & Stationery": ["Office Supplies", "School Supplies", "Furniture", "Printers"],

                        "Industrial & Tools": ["Power Tools", "Hand Tools", "Safety", "Construction"],

                        "Software & Digital": ["Software", "Subscriptions", "Courses", "E-books"],

                        "Services": ["Home Services", "Repairs", "Travel", "Events"]
                    }
                }
            })
        }
    }
    catch (error) {
        console.error("Error initializing site config:", error)
    }
}

export default initializeSiteConfig