import { UserWithResults } from '../utils/types';

declare global {
    namespace Express {
        interface Request {
            user?: UserWithResults
        }
    }
}
