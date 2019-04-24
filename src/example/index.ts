import * as express from 'express';
import {router} from './router';
import * as BodyParser from 'body-parser';
import * as joi from 'joi';
import {Doc} from '../Doc';
import {validate} from '../joi-express/index';
import {settings} from './settings';
import {isValidate} from "../joi-express/isValidate";

const app = express();
app.use(BodyParser.json());

const schema = {
    body: {
        test1: joi.string().required()
    },
    model: 'Register',
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

    if(isValidate(res)) {

        console.log('This request has been validated!');

        res.json({ok: 1})
    }

    next();
});

app.listen(3000, () => {
    Doc(app, settings);
});
