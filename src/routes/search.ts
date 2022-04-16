import axios from "axios";
import {createClient } from 'redis'
import { Request, Response, NextFunction} from 'express'
import {Tedis, TedisPool} from 'tedis';
import { Router } from "express";
const baseURL= 'https://api.github.com/search/users'

/**
 * @swagger
 * components:
 *   schemas:
 *      User:
 *       type: object
 *       required:
 *         - name
 *         - url
 *         - avatar
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the githubuser 
 *         url:
 *           type: string
 *           description: The url of the user
 *         avatar:
 *           type: string
 *           description: The avatar of the user
 *       example:
 *          name: kaushikdkrikhanu
 *          url: "https://api.github.com/users/Kaushikdkrikhanu"
 *          avatar: "https://avatars.githubusercontent.com/u/55996465?v=4"
 *      Text:
 *       type: object
 *       required: 
 *          - text
 *       properties:
 *          text:
 *              type: string
 *              description: The user to search for
 *          type:
 *              type: string
 *              description: The type of search
 *       example:
 *          text: kaushik
 *          type: users
 * 
 *          
 */
/**
  * @swagger
  * tags:
  *   name: GithubSearch
  *   description: Look up github users
  */

interface User {
    name: string,
    url : string,
    avatar: string,
}

/**
 * @swagger
 * /api/search:
 *   post:
 *     summary: Search for users
 *     tags: [GithubSearch]
 *     requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/Text'
 *              
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       400:
 *          description: Type is not users
 *          content:
 *            text/html:
 *                  schema:
 *                      type: string
 *                      enum : [Wrong Type]
 *       500:
 *          description: Server error
 *          content:
 *              text/html:
 *                  schema:
 *                      type: string
 *                      enum: [Unable to obtain result]
 *              
 * 
 *          
 */

const client = new Tedis({
    host: 'redis-19547.c15.us-east-1-2.ec2.cloud.redislabs.com',
    port: 19547,
    password: 'Aa23IQwUlhakvw3ISqCqSUXWagxuKApF'
})
 const cache = async (req: Request,res: Response,next: NextFunction) =>{
    const {text,type} = req.body;
    if(type!=="users"){ 
        res.status(400).send("Wrong type");
        return;
    }
    try{
       
        const data  = await client.get(text) as string
        if(data!==null){
            const res1: User []  = JSON.parse(data);
            res.send(res1);
            console.log(JSON.parse(data));
        }  
        else{
            next();
        }
    }
    catch(e){
        console.log("cache",e);
    }
}

const getUsers = async (req: Request,res:Response) =>{
    const {text,type} = req.body;
    if(type!=="users"){ 
        res.status(400).send("Wrong type");
        return;
    }
    const newUrl = baseURL + `?q=${text}`
    const {data,status} = await axios.get(newUrl);
    if(status===200){
        const users:User[] = [];
        data.items.map((item: any)=>{
            users.push({name: item.login,url: item.url,avatar: item.avatar_url});
        })
        const res1: User[] = users
        res.status(200).send(res1);
        try{
            await client.setex(text,7200,JSON.stringify(users))
        }
        catch(e){
            console.log(e);
        }
    }    
    else{        
        res.sendStatus(500).send("Unable to obtain result");        
    }
}

const router = Router();

router.post('/',cache,getUsers);

export default router;
