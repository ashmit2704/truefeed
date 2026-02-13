import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { z } from 'zod';
import { verifySchema } from '@/schemas/verifySchema';
import { usernameValidation } from '@/schemas/signUpSchema';

const UsernameQuerySchema = z.object({
    username: usernameValidation
});

const VerifyQuerySchema = z.object({
    verifyCode: verifySchema
});

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {username, code} = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const usernameResult = UsernameQuerySchema.safeParse({username: decodedUsername});
        const verifyCode = {code}
        const verifyResult = VerifyQuerySchema.safeParse({verifyCode});

        if(!usernameResult.success) {
            const tree = z.treeifyError(usernameResult.error);
            const usernameErrors = tree.properties?.username?.errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid query parameters'
            }, {status: 400});
        }

        if(!verifyResult.success) {
            const tree = z.treeifyError(verifyResult.error);
            const verifyErrors = tree.properties?.verifyCode?.properties?.code?.errors || [];

            return Response.json({
                success: false,
                message: verifyErrors.length > 0 ? verifyErrors.join(", ") : "Verify code must be 6 digits"
            }, {status: 400});
        }

        // console.log('Username: ', usernameResult, '\n', 'VerifyCode: ', verifyResult);

        const user = await UserModel.findOne({username: decodedUsername})

        if(!user) {
            return Response.json({
                success: false,
                message: 'User not found'
            }, {status: 500})
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if(isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();

            return Response.json({
                success: true,
                message: 'Account verified successfully'
            }, {status: 200})
        } else if(!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: 'Verification code has expired, signup again to get a new code'
            }, {status: 400})
        } else {
            return Response.json({
                success: false,
                message: 'Incorrect verification code'
            }, {status: 400})
        }

    } catch (error) {
        console.error('Error verifying user', error);

        return Response.json({
            success: false,
            message: 'Error verifying user'
        }, {status: 500})
    }
}