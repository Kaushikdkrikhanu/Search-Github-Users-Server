import {createClient} from 'redis'
import {Request, Response, NextFunction} from 'express'
import { Router } from 'express';
/**
  * @swagger
  * tags:
  *   name: ClearCache
  *   description: Clear the cache
  */

/**
 * @swagger
 * /api/clear-cache:
 *   get:
 *     summary: clear the cache
 *     tags: [ClearCache]
 *              
 *     responses:
 *       200:
 *          description: Cache cleared Successfully
 *          content:
 *            text/html:
 *                  schema:
 *                      type: string
 *                      enum : [successfull]
 *       501:
 *          description: Unable to clear cache
 *          content:
 *              text/html:
 *                  schema:
 *                      type: string
 *                      enum: [unsuccessfull]
 *              
 * 
 *          
 */
 const clearCache = async (req: Request,res: Response)=>{
    const client = createClient();
    client.on('error', (err)=> console.log('Redis Client Error',err))
    client.connect();
    try{
        client.flushAll();
        res.status(200).send("Succesfull");
    }
    catch(e){
        console.log("Error flushing",e);
        res.status(501).send("Unable to clear Cache");
    }
    
}

const router = Router();
router.get('/',clearCache);

export default router;