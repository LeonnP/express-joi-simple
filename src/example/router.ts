import { Router } from 'express';
import {validate} from '../joi-express/index';
import * as joi from 'joi';

export const router: any = Router();

const schema = {
    body: {
        test1: joi.string().required()
    },
    model: 'Login',
    responses:
        {
            200: {
                description: "success"
            },
            404: {
                description: "fail"
            }
        },
}

router.post('/test', validate(schema), (req: any, res: any) => {
    res.json({ message: 'test' });
})
