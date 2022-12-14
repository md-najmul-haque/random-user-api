const { loadUser } = require("../model/userModel");
const usersRoutes = require("../routes/userRoutes/users.routes");
const fs = require("fs");
const generateID = require("../utils/generateID");

//controller 
const controller = {};

//get random user
controller.getRandomUser = (req, res, next) => {
    const users = loadUser();
    if (Array.isArray(users) && users.length > 0) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        res.status(200).json({
            success: true,
            message: 'random user',
            randomUser
        })
    } else {
        res.status(500).json({
            success: false,
            message: 'No user found',
        })
    }
}

//get all user
controller.getAllUser = (req, res, next) => {
    const { limit } = req.query
    const users = loadUser();
    if (Array.isArray(users) && users.length > 0) {
        if (limit) {
            const limitedUser = users.slice(0, limit);
            res.status(200).json({
                success: true,
                message: 'Limited User',
                limitedUser
            })
        } else {
            res.status(200).json({
                success: true,
                message: 'All User',
                users
            })

        }
    } else {
        res.status(500).json({
            success: false,
            message: 'No user found',
        })
    }

}

//save a user
controller.postUser = (req, res, next) => {

    if (typeof req.body === 'object' && Array.isArray(req.body) === false) {
        const { gender, name, contact, address, photoURL } = req.body

        const userGender =
            typeof gender === 'string' &&
                gender.trim().length > 0 &&
                (gender.toLocaleLowerCase() === 'male' ||
                    gender.toLocaleLowerCase() === 'female' ||
                    gender.toLocaleLowerCase('others')) ? gender : false

        const userName = typeof name === 'string' && name.trim().length > 0 ? name : false;
        const userContact = typeof contact === 'string' && contact.trim().length === 11 ? contact : false;
        const userAddress = typeof address === 'string' && address.trim().length > 0 ? address : false;
        const userPhotoURL = typeof photoURL === 'string' && address.trim().length > 0 ? photoURL : false;

        if (userGender && userName && userContact && userAddress && userPhotoURL) {

            let newUser = {
                _id: generateID(5),
                name: userName,
                gender:
                    userGender.charAt(0).toUpperCase() +
                    userGender.slice(1).toLocaleLowerCase(),
                contact: userContact,
                address: userAddress,
                photoURL: userPhotoURL,
            }

            const users = loadUser();
            users.push(newUser)
            let newUsers = JSON.stringify(users);

            fs.writeFile("user.json", newUsers, (err) => {
                // Error checking
                if (!err) {
                    res.status(201).json({
                        success: true,
                        message: "user created successfully",
                        newUsers
                    })
                } else {
                    res.status(500).json({
                        success: false,
                        message: "Internal server error. User not created",
                        err,
                    });
                }
            });


        } else {
            res.status(400).json({
                success: false,
                message: "User is not created. Missing required fields",
            })
        }

    } else {
        res.status(400).json({
            success: false,
            message: 'invalid body request'
        })
    }
}

controller.updateUser = (req, res, next) => {
    let users = loadUser()  
    const _id = req.params.id
    // console.log(_id)
    const { name, gender, address, contact, photoURL } = req.body;

    const userID = typeof _id === "string" ? _id : false;
    // console.log(userID)
    const userGender =
        typeof gender === "string" &&
            gender.trim().length > 0 &&
            (gender.toLocaleLowerCase() === "male" ||
                gender.toLocaleLowerCase() === "female" ||
                gender.toLocaleLowerCase() === "other")
            ? gender
            : false;

    const userName = typeof name === "string" && name.trim().length > 0 ? name : false;

    const userContact =
        typeof contact === "number" && contact.toString().trim().length === 11
            ? contact
            : false;

    const userAddress =
        typeof address === "string" && address.trim().length > 0 ? address : false;

    const userPhotoURL =
        typeof photoURL === "string" && photoURL.trim().length > 0
            ? photoURL
            : false;

    if (Array.isArray(users) && users.length > 0) {
        const user = users.find((user) => user._id === _id);
        const restUsers = users.filter(user => user._id !== _id)
        // console.log(typeof restUsers);

        if (user) {
            if (
                userID &&
                (userGender || userName || userContact || userAddress || userPhotoURL)
            ) {
                const updatedUser = {
                    _id: user._id,
                    name: userName ? userName : user.name,
                    gender: userGender ? userGender : user.gender,
                    contact: userContact ? userContact : user.contact,
                    address: userAddress ? userAddress : user.address,
                    photoURL: userPhotoURL ? userPhotoURL : user.photoURL,
                };

                restUsers.push(updatedUser);

                const updatedUsersJson = JSON.stringify(restUsers)

                fs.writeFile("user.json", updatedUsersJson, (err) => {
                    if (!err) {
                        res.status(201).json({
                            success: true,
                            message: "user updated successfully",
                            updatedUsersJson
                        })
                    } else {
                        res.status(500).json({
                            success: false,
                            message: "Internal server error. User not is updated",
                            err,
                        });
                    }
                });

            } else {
                res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                });
            }
        } else {
            res.status(404).json({
                success: false,
                message: "This user is not found",
            });
        }
    } else {
        res.status(500).json({
            success: false,
            message: "Internal server error. No users found",
        });
    }
}

controller.deleteUser = (req, res, next) => {
    const users = loadUser()
    const id = req.params.id
    const userID = typeof id === "string" ? id : false;

    if (userID) {
        if (Array.isArray(users) && users.length > 0) {
            const user = users.find((user) => user._id === userID);
            if (user) {
                // let users = JSON.parse(fs.readFileSync("user.json"));               
                const result = users.filter(user => user._id != id)
                let restUser = JSON.stringify(result);
                fs.writeFile("user.json", restUser, (err) => {
                    if (!err) {
                        res.status(200).json({
                            success: true,
                            message: "User deleted successfully",
                        });

                    } else {
                        res.status(500).json({
                            success: false,
                            message: "Internal server error. User not deleted",
                        });
                    };
                });


            } else {
                res.status(404).json({
                    success: false,
                    message: "This user is not found",
                });
            }
        } else {
            res.status(500).json({
                success: false,
                message: "Internal server error. No users found",
            });
        }

    } else {
        res.status(400).json({
            success: false,
            message: "Invalid request body",
        });
    }

};

//export controller 
module.exports = controller;