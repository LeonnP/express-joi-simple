import { Router } from 'express';
import {validate} from '../validate-middleware';
import * as joi from 'joi';

export const router: any = Router();

const schema = {
    body: {
        test1: joi.string().required()
    },
    model: {
        name: 'Login'
    },
    visible: true
}

router.post('/test', validate(schema), (req: any, res: any) => {
    res.json({ message: 'test' });
})
