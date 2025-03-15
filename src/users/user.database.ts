import { UnitUser } from './user.interface';
import bcrypt from 'bcryptjs';
import { v4 as random } from 'uuid';
import { db } from '../firebase';


export const create = async (newUser: UnitUser): Promise<UnitUser | null> => {
    
    let id = random();
    let check_user = await findOne(id);

    while (check_user) {
        id = random();
        check_user = await findOne(id);
    }

    const asin = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, asin);
    
    const user: UnitUser = {
        id: id,
        username: newUser.username,
        email: newUser.email,
        password: hashedPassword,
    };

    try{
        await db.ref(`users/${id}`).set(user);
        console.log('User created successfully:', user);
        return user;
    } catch (error) {
        console.log(` Error creating user: ${error}`);
        return null;
    }
};

export const findAll = async (): Promise<UnitUser[]> => {
    try{
        const snapshot = await db.ref("users").once("value");
        return snapshot.val() ? Object.values(snapshot.val()) : [];
    } catch (error) {
        console.error(` Error fetching users: ${error}`);
        return [];
    }
};

export const findOne = async (id: string): Promise<UnitUser | null> => {
    try{
        const snapshot = await db.ref(`users/${id}`).once("value");
        return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
        console.error(` Error fetching user: ${error}`);
        return null;
    }
};   



export const findByEmail = async (user_email: string): Promise<UnitUser | null> => {
    try{
        const snapshot = await db.ref("users").orderByChild("email").equalTo(user_email).once("value");
        const user = snapshot.val();
        return user ? Object.values(user)[0] as UnitUser : null;
    } catch (error) {
        console.error("Error finding user by email:", error);
        return null;
    }
};

export const comparePassword = async (email : string, supplied_password : string): Promise<null | UnitUser> => {
    const user = await findByEmail(email);

    const decrypted_password = await bcrypt.compare(supplied_password, user!.password);

    if(!decrypted_password){
        return null;
    }

    return user;
};

export const update = async (id: string, updateValues: Partial<UnitUser>): Promise<UnitUser | null> => {
    
    const userExists = await findOne(id);
    if(!userExists){
        return null;
    }

    if(updateValues.password){
        const asin = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(updateValues.password, asin);

        updateValues.password = newPassword;
    }

    try {
        await db.ref(`users/${id}`).update(updateValues);
        console.log('User updated successfully:', userExists);
        return { ...userExists, ...updateValues };
    } catch (error) {
        console.log(` Error updating user: ${error}`);
        return null;
    }
};

export const remove = async (id: string): Promise<boolean> => {

    try {
        await db.ref(`users/${id}`).remove();
        console.log('User deleted successfully');
        return true;
        
    } catch (error) {
        console.error(` Error deleting user: ${error}`);
        return false;
    }
};

export const removeAll = async (): Promise<boolean> => {
    try{
        await db.ref("users").remove();
        console.log('All users deleted successfully');
        return true;
    } catch (error) {
        console.log(` Error deleting users: ${error}`);
        return false;
    }
}; 



/**
    * @description This part is for json type database
    * @file        users/user.database.ts
    
    import { User, UnitUser, Users } from './user.interface';
    import bcrypt from 'bcryptjs';
    import { v4 as random } from 'uuid';
    import fs from 'fs';

    let users: Users = loadUsers();

    function loadUsers(): Users {
        try {
            const data = fs.readFileSync('./users.json', 'utf8');
            const parsedData = JSON.parse(data);

            // 🛠 Ensure it returns an OBJECT `{}` instead of ARRAY `[]`
            if (typeof parsedData !== 'object' || Array.isArray(parsedData)) {
                console.log('Invalid users.json format. Resetting to {}...');
                return {};
            }

            return parsedData;
        } catch (error) {
            console.log(` Error loading users: ${error}`);
            return {};
        }
    }


    function saveUsers() {
        try {
            // 🛠 Prevent overwriting with an array (`[]`), always ensure an object (`{}`)
            if (typeof users !== 'object' || Array.isArray(users)) {
                console.log('Invalid users format before saving. Resetting...');
                users = {}; // Reset to empty object
            }

            fs.writeFileSync('./users.json', JSON.stringify(users, null, 2), 'utf8');
            console.log('Users saved successfully:', users);
        } catch (error) {
            console.log(` Error saving users: ${error}`);
        }
    }


    export const findAll = async (): Promise<UnitUser[]> => Object.values(users);

    export const findOne = async (id: string): Promise<UnitUser | null> => users[id] || null;   

    export const create = async (newUser: UnitUser): Promise<UnitUser | null> => {
        let id = random();
        let check_user = await findOne(id);

        while (check_user) {
            id = random();
            check_user = await findOne(id);
        }

        const asin = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newUser.password, asin);
        
        const user: UnitUser = {
            id: id,
            username: newUser.username,
            email: newUser.email,
            password: hashedPassword,
        };

        users[id] = user;
        saveUsers();

        return user;
    };

    export const findByEmail = async (user_email: string): Promise<null | UnitUser> => {
        
        const allUsers = await findAll();
        const getUser = allUsers.find(result => user_email === result.email);

        if(!getUser){
            return null;
        }

        return getUser;
    };

    export const comparePassword = async (email : string, supplied_password : string): Promise<null | UnitUser> => {
        const user = await findByEmail(email);

        const decrypted_password = await bcrypt.compare(supplied_password, user!.password);

        if(!decrypted_password){
            return null;
        }

        return user;
    };

    export const update = async (id: string, updateValues: User): Promise<UnitUser | null> => {
        
        const userExists = await findOne(id);
        if(!userExists){
            return null;
        }

        if(updateValues.password){
            const asin = await bcrypt.genSalt(10);
            const newPassword = await bcrypt.hash(updateValues.password, asin);

            updateValues.password = newPassword;
        }

        users[id] = {
            ...userExists,
            ...updateValues,
        };

        saveUsers();
        return users[id];
    };

    export const remove = async (id: string): Promise<null | void> => {

        const user = await findOne(id);

        if(!user){
            return null;
        }

        delete users[id];

        saveUsers();
    };

    export const removeAll = async (): Promise<void> => {
        try{
            users = {};
            saveUsers();
            console.log('All users deleted successfully');
        } catch (error) {
            console.log(` Error deleting users: ${error}`);
        }
    }; 
 */