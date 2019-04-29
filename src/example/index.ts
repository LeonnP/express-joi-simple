import * as express from 'express';
import {router} from './router';
import * as BodyParser from 'body-parser';
import * as joi from 'joi';
import {Doc} from '../Doc';
import {validate, isValidate} from '../validate-middleware';

const settings = {
    info: {
        "title": "Title Example",
        "description": "Description API example",
        "termsOfService": "http://swagger.io/terms/",
        "contact": {
            "name": "Example team"
        },
        "license": {
            "name": "MIT"
        }
    },
    host: 'localhost:3000',
    basePath: '/',
    documentationPath: '/doc',
    filePath: './uploads/swagger.json'
};

const app = express();
app.use(BodyParser.json());

const schema = {
    body: {
        test1: joi.string().example('asd').description('hi').required()
    },
    responses:
        {
            200: {
                description: "success"
            },
            404: {
                description: "fail"
            }
        },
};


app.post('/register', validate(schema), (req: any, res: any, next) => {

    next();
});

app.use('/login', router);

// test isValidate()
app.use((req, res, next) => {

    if (isValidate(res)) {

        console.log('This request has been validated!');

        res.json({ok: 1})
    }

    next();
});

app.use((err: any, req: any, res: any, next: any) => {

    if(isValidate(res)){

        res.json({message: 'Validation errors occured: ' + err.details.map((err: any)  => err.message).join(', ')});
    }
    else {

        res.json(err)
    }

});

app.listen(3000, () => {
    Doc(app, settings);
});
