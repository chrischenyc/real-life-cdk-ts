import express from 'express';
import { createValidator } from 'express-joi-validation';
import httpStatus from 'http-status';
import Joi from 'joi';

import { APIError } from '../common/api-error';
import { userStore } from '../store/user/user-store';

export const users = express.Router();
const validator = createValidator();

// POST /users - create a new user
users.post(
    '/',
    validator.body(
        Joi.object({
            username: Joi.string().required().min(4).max(10).alphanum(),
            fullName: Joi.string().required().max(50),
            email: Joi.string().email().required(),
            address: Joi.string().max(200).empty(),
        })
    ),
    async (req, res) => {
        try {
            await userStore.createUser(req.body);

            res.status(httpStatus.CREATED).json({ message: 'user created' });
        } catch (error) {
            if (error instanceof APIError) {
                res.status(error.httpStatus).json({ message: error.message });
            } else {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error });
            }
        }
    }
);

// get /users/:id - get a user
users.get('/:username', validator.params(Joi.object({ username: Joi.string().required() })), async (req, res) => {
    try {
        const user = await userStore.getUser(req.params.username);
        res.json(user);
    } catch (error) {
        if (error instanceof APIError) {
            res.status(error.httpStatus).json({ message: error.message });
        } else {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error });
        }
    }
});

// patch /users/:id - update a user
users.patch(
    '/:username',
    validator.params(Joi.object({ username: Joi.string().required() })),
    validator.body(
        Joi.object({
            fullName: Joi.string().max(50).empty(),
            email: Joi.string().email().empty(),
            address: Joi.string().max(200).empty(),
        })
    ),
    async (req, res) => {
        try {
            await userStore.updateUser(req.params.username, req.body);

            res.status(httpStatus.OK).json({ message: 'user updated' });
        } catch (error) {
            if (error instanceof APIError) {
                res.status(error.httpStatus).json({ message: error.message });
            } else {
                res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error });
            }
        }
    }
);
