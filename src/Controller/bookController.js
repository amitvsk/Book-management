const bookModel = require("../Models/bookModel");
const reviewModel = require("../Models/reviewModel");
const Validator = require("../Validator/valid");

const Book = async function (req, res){

    try {
        const data = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory } = data

       /*----------------------------validations ----------------------------*/
        if(!Validator.isValidReqBody(data)){return res.status(400).send({status:false,msg:"Please provide user data"})}
       
        if(!Validator.isValid(title)) return res.status(400).send({status: false,message: "Title is Required"});
        if (!Validator.isValidTitle(title)) return res.status(400).send({ status: false, message: "Title must be : Mr/ Miss/ Mrs" })
        
        let titleCheck = await bookModel.findOne({ title: title })
        if (titleCheck) return res.status(400).send({ status: false, message: " title already exists , Enter unique value" })

        if(Validator.isValid(excerpt)) return res.status(400).send({status: false,message: "Title is Required"});
        if (!Validator.isValidExcerpt(excerpt)) return res.status(400).send({ status: false, message: "Excerpt is Required" });
        
        //check userId is valid or not
        if (!Validator.isValid(userId)) return res.status(400).send({ status: false, message: "userId is Required" });
        if (!Validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is not a valid ObjectId" });

        //check ISBN is valid or not
        if (!Validator.isValid(ISBN)) return res.status(400).send({ status: false, message: "ISBN is Required" });

        let userIdCheck = await bookModel.findOne({ ISBN: ISBN })
        if (userIdCheck) return res.status(400).send({ status: false, message: " ISBN already exists , Enter unique value" })
      
        if (!Validator.isValid(category)) return res.status(400).send({ status: false, message: "category is Required" });
        
        if (!Validator.isValid(subcategory)) return res.status(400).send({ status: false, message: "subcategory is Required" });

        /*----------------------------create book ----------------------------*/
        let savedData = await bookModel.create(data)
        return res.status(201).send({ status: true, message: "success", data: savedData });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


/**************************************** GET BOOKS ******************************************/
const getBooks = async function (req, res) {
    try {

        let fieldToUpdate = {
            userId: req.query.userId,
            category: req.query.category,
            subcategory: req.query.subcategory
        };

        for (const [key, value] of Object.entries(fieldToUpdate)) {
            if (!value) delete fieldToUpdate[key];
        }
        const book = await bookModel.find({ $and: [{ isDeleted: false }, fieldToUpdate] }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).collation({locale : "en"}).sort({ title: 1 });
        if (book.length == 0) return res.status(404).send({ status: false, message: "Book not found" })

        return res.status(200).send({ status: true, message: "Success", data: book })


    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

/***************************************************GET/books/:bookId*****************************************/

const getBooksBybookId = async function(req,res){
   
   try{ 
    let bookId = req.params.bookId;
    if (!Validator.isValid(bookId)) return res.status(400).send({ status: false, message: "bookId is Required" });
    if (!Validator.isValidObjectId(bookId)) return res.status(400).send({ status: false, message: "bookId is not valid" });

    let book = await bookModel.findById(bookId ,{isDeleted : false})

    if(!book) return res.status(404).send({status : false , message : "Book does not exist with this id"})
    let reviews = await reviewModel.find({bookId : bookId,isDeleted : false})
    
    //stringifying book model object to add key
    let temp = JSON.stringify(book);
    let obj = JSON.parse(temp);
    obj.reviewsData = reviews;
    return res.status(200).send({status : true , data : obj})
   }
   catch(err){
       return res.status(500).send({message : err.message})
   }
}

/************************************************ Update Book data ***************************************************/
const updateBook = async function (req, res) {
    try {
        let bookId = req.params.bookId

        let fieldToUpdate = {
            title: req.body.title,
            excerpt: req.body.excerpt,
            releasedAt: req.body.releasedAt,
            ISBN: req.body.ISBN

        };

        for (const [key, value] of Object.entries(fieldToUpdate)) {
            if (!value) delete fieldToUpdate[key];
        }

        const checktitle = await bookModel.findOne({ title: req.body.title, isDeleted: false })
        if (checktitle) {
            return res.status(400).send({ status: false, message: 'title should be unique please try with another option' })
        }

        const checkISBN = await bookModel.findOne({ ISBN: req.body.ISBN, isDeleted: false })
        if (checkISBN) {
            return res.status(400).send({ status: false, message: 'ISBN should be unique please try with another option' })
        }

        const checkBook = await bookModel.findOneAndUpdate({_id:bookId,isDeleted:false },{ $set: { ...fieldToUpdate } },
            { new: true })

        return res.status(201).send({ Status: true, message: "Updated", Data: checkBook })
    }
    catch (error) {
        return res.status(500).send({ message: error.message });
    }
}

/**************************************** Delete book ********************************************/

const deleteBook = async function (req, res) {
    let bookid = req.params.bookId;

    if (!Validator.isValid(bookid)) return res.status(400).send({ status: false, message: "book id is Required" });
    if (!Validator.isValidObjectId(bookid)) return res.status(400).send({ status: false, message: "bookId is not valid" });
   
    let bookDetails = await bookModel.findById(bookid)
    if (!bookDetails) { return res.status(404).send({ status: false, msg: "This book id are not exists" }) }
    //check the book data is deleted or not
    if (bookDetails.isDeleted == false) {
        let deleted = await bookModel.findByIdAndUpdate(bookid, { $set: { isDeleted: true, deletedAt: new String(Date()) } }, { new: true });
        return res.status(200).send({ status: true, msg: "Deleted Successfully"}) // delete the book data and update the deletedAt
    } else {
        return res.status(400).send({ status: false, msg: "this book is already deleted" })
    }

}



module.exports = { Book, getBooks,getBooksBybookId, updateBook, deleteBook }


