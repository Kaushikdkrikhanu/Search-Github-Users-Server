import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {createClient} from 'redis'
import swaggerUI from 'swagger-ui-express'
import swaggerJsDoc from "swagger-jsdoc"
import {Tedis, TedisPool} from 'tedis';
import config from '../config/default';
import userRouter from './routes/search'
import clearRouter from './routes/clearCache'

console.log("hello");
const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Github sdearch users API",
			version: "1.0.0",
			description: "A simple Express API to search github users",
        },
		servers: [
			{
				url: "http://localhost:5000",
			},
		],       
	},
	apis: ["./src/routes/*.ts"],

};

const specs = swaggerJsDoc(options);

const app = express();
app.use("/api-docs", swaggerUI.serve,swaggerUI.setup(specs))
app.use(cors());
app.use(bodyParser.json());


const add  = (a: number,b: number): string =>(
    ""+ a+b
     );

app.get('/',(req,res)=>{
    res.send('Hello');
}
)

 app.use("/api/search",userRouter);
 app.use("/api/clear-cache",clearRouter);
app.listen(config.port,()=>{
    console.log("Server Starting");     
})