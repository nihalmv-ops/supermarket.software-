import { IUserDocument } from '../models/user.model.js';
import { IBusinessDocument } from '../models/business.model.js';
import { IBusinessMembershipDocument } from '../models/businessMembership.model.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      business?: IBusinessDocument;
      membership?: IBusinessMembershipDocument;
    }
  }
}

export {};
