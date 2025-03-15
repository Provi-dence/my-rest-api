import express, { Request, Response } from "express";
import { UnitUser } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router()

userRouter.get("/users", async (req: Request, res: Response): Promise<any> => {
    try{
        const allUsers : UnitUser[] = await database.findAll();

        if(!allUsers){
            return res.status(StatusCodes.NOT_FOUND).json({msg: `No user found...`});
        }

        return res.status(StatusCodes.OK).json({total_user: allUsers.length, allUsers});

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
});

userRouter.get("/users/:id", async (req: Request, res: Response): Promise<any> => {
    try{
        const user : UnitUser | null = await database.findOne(req.params.id);

        if(!user){
            return res.status(StatusCodes.NOT_FOUND).json({msg: `User not found...`});
        }

        return res.status(StatusCodes.OK).json({user});
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
    }
})

userRouter.post("/register", async (req: Request, res: Response): Promise<any> => {
    try {
      const { username, email, password } = req.body
  
      console.log(req.body);

      if (!username || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide all the required parameters..' })
      }
  
      const user = await database.findByEmail(email)
  
      if (user) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'This email has already been registered..' })
      }
  
      const newUser = await database.create(req.body)
  
      return res.status(StatusCodes.CREATED).json({ newUser })
  
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
    }
  })

  userRouter.post("/login", async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password } = req.body
  
      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters.." })
      }
  
      const user = await database.findByEmail(email)
  
      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "No user exists with the email provided.." })
      }
  
      const comparePassword = await database.comparePassword(email, password)
  
      if (!comparePassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Incorrect Password!" })
      }
  
      return res.status(StatusCodes.OK).json({ user })
  
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
    }
  })


  userRouter.put('/user/:id', async (req: Request, res: Response): Promise<any> => {
    try {
      const { username, email, password } = req.body
  
      const getUser = await database.findOne(req.params.id)
  
      if (!username || !email || !password) {
        return res.status(401).json({ error: 'Please provide all the required parameters..' })
      }
  
      if (!getUser) {
        return res.status(404).json({ error: `No user with id ${req.params.id}` })
      }
  
      const updateUser = await database.update(req.params.id, req.body)
  
      return res.status(201).json(updateUser)
  
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error })
    }
  })

  userRouter.delete("/user/:id", async (req: Request, res: Response): Promise<any> => {
    try {
      const id = (req.params.id)
      const user = await database.findOne(id)

      if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: `No user with id ${req.params.id}` })
      }

      await database.remove(id)
  
      return res.status(StatusCodes.OK).json({ msg: "User deleted successfully" })
  
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error })
    }
  });

userRouter.delete("/users", async (req: Request, res: Response): Promise<any> => {
  try{
    await database.removeAll();

    return res.status(StatusCodes.OK).json({msg: `All users deleted successfully...`});

  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error});
  }
});


/**

import express, { Request, Response } from "express";
import { UnitUser } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

export const userRouter = express.Router();

userRouter.get("/users", async (req: Request, res: Response): Promise<any> => {
    try {
        const allUsers: UnitUser[] = await database.findAll();
        return res.status(StatusCodes.OK).json({ total_users: allUsers.length, allUsers });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error fetching users" });
    }
});

userRouter.get("/users/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const user: UnitUser | null = await database.findOne(req.params.id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
        }
        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error fetching user" });
    }
});

userRouter.post("/register", async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters" });
        }

        const existingUser = await database.findByEmail(email);
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({ error: "This email has already been registered" });
        }

        const newUser = await database.create(req.body);
        return res.status(StatusCodes.CREATED).json({ newUser });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error registering user" });
    }
});

userRouter.post("/login", async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters" });
        }

        const user = await database.findByEmail(email);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: "No user exists with the email provided" });
        }

        const isPasswordValid = await database.comparePassword(email, password);
        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Incorrect Password!" });
        }

        return res.status(StatusCodes.OK).json({ user });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error logging in" });
    }
});

userRouter.put("/user/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all required parameters" });
        }

        const getUser = await database.findOne(req.params.id);
        if (!getUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `No user with id ${req.params.id}` });
        }

        const updatedUser = await database.update(req.params.id, req.body);
        return res.status(StatusCodes.OK).json(updatedUser);
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error updating user" });
    }
});

userRouter.delete("/user/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = req.params.id;
        const user = await database.findOne(id);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `No user with id ${id}` });
        }

        await database.remove(id);
        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error deleting user" });
    }
});

userRouter.delete("/users", async (req: Request, res: Response): Promise<any> => {
    try {
        await database.removeAll();
        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Error deleting all users" });
    }
});

 */