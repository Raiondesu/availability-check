import { hash } from '../../util';
import { StatusCodes } from '../../server/statuses';
import DataManager from '../../lib/data';
import { RouteData, RoutePayload } from '../../lib/route/types';
import Route from '../../lib/route';

interface UserUpdate {
  firstName?: string;
  lastName?: string;
  phone: string;
  password?: string;
  tosAgreement?: any;
}

interface UserResponse extends UserUpdate {
  firstName: string;
  lastName: string;
  phone: string;
  tosAgreement: any;
}

interface UserRequest extends UserResponse {
  password: string;
}

interface User extends UserRequest {
  tosAgreement: true;
}

function validateFields(payload, required) {
  // Validate payload fields
  for (const key in required) {

    // If some field is undefined or empty - raise missing field error
    if (
      (typeof payload[key] === required[key] && !payload[key].replace(/\s/g, ''))
      || typeof payload[key] === 'undefined'
    ) {
      return {
        status: StatusCodes.BadRequest,
        payload: `Missing required field - ${key}`
      };
    }
    // If some field is of wrong type - raise type error
    else if (typeof payload[key] !== required[key]) {
      return {
        status: StatusCodes.BadRequest,
        payload: String(new TypeError(`Field type of '${typeof payload[key]}' for ${key} is invalid, must be '${required[key]}'`))
      };
    }
    // Simply truncate the field otherwise
    else {
      payload[key] = payload[key].replace(/\s/g, '');
    }
  }

  return;
}

const users = {
  async POST(data: RouteData<UserRequest>): Promise<RoutePayload<any>> {
    // Check user fields
    const required = {
      'firstName': 'string',
      'lastName': 'string',
      'password': 'string',
      'phone': 'string',
      'tosAgreement': 'string',
    };

    const validaitionError = validateFields(data.payload, required);

    if (validaitionError) {
      return validaitionError;
    }

    if (data.payload.phone.length < 10) {
      return {
        status: StatusCodes.BadRequest,
        payload: `Phone must be longer than 9 digits`
      };
    }

    try {
      const user = await DataManager.read('users/' + data.payload.phone);
      if (user) {
        return {
          status: StatusCodes.Conflict,
          payload: 'User already exists'
        };
      }
    } catch (e) {
      const passwordHash = hash(data.payload.password);

      const user: User = {
        ...data.payload,
        password: passwordHash,
        tosAgreement: true
      };

      try {
        await DataManager.write('users/' + user.phone, user);
      } catch (e) {
        throw new Error('Could not create user');
      }
    }

    return { status: StatusCodes.OK };
  },

  // Requres query parameter "phone"
  // @TODO: only let authenticated uses access their data
  async GET(data: RouteData): Promise<RoutePayload<UserResponse | string>> {
    if (!data.query.phone) {
      return {
        status: StatusCodes.BadRequest,
        payload: `Provide the phone number as query parameter`
      };
    }
    else if (data.query.phone.length < 10) {
      return {
        status: StatusCodes.BadRequest,
        payload: `Phone must be longer than 9 digits`
      };
    }

    try {
      // Exclude password from the mix
      const { password, ...user } = await DataManager.read<User>('users/' + data.query.phone);

      return {
        status: StatusCodes.OK,
        payload: user
      };
    } catch (e) {
      return {
        status: StatusCodes.NotFound,
        payload: 'User not found'
      };
    }
  },

  // Required Field: phone
  // @TODO: only let authenticated uses access their data
  async PUT(data: RouteData<UserUpdate>): Promise<RoutePayload<string | UserResponse>> {
    validateFields(data.payload, {
      'phone': 'string'
    });

    if (data.payload.phone.length < 10) {
      return {
        status: StatusCodes.BadRequest,
        payload: `Phone must be longer than 9 digits`
      };
    }

    try {
      const user: User = { ...await DataManager.read('users/' + data.payload.phone), ...data.payload };

      if (data.payload.password) {
        user.password = hash(data.payload.password);
      }

      await DataManager.write('users/' + user.phone, user);

      const { password, ...result } = user;

      return {
        status: StatusCodes.OK,
        payload: result
      };
    } catch (e) {
      return {
        status: StatusCodes.NotFound,
        payload: 'User not found'
      };
    }
  },

  // Required: phone query parameter
  async DELETE(data: RouteData): Promise<RoutePayload<UserResponse | string>> {
    validateFields(data.query, {
      'phone': 'string'
    });

    if (!data.query.phone || data.query.phone.length < 10) {
      return {
        status: StatusCodes.BadRequest,
        payload: `Phone must be longer than 9 digits`
      };
    }

    try {
      const { password, ...user } = await DataManager.read('users/' + data.query.phone);

      await DataManager.delete('users/' + data.query.phone);

      return {
        status: StatusCodes.OK,
        payload: user
      };
    } catch (e) {
      return {
        status: StatusCodes.OK
      };
    }
  }
};

export default Route.with(async data => {
  const acceptableMethods = Object.keys(users);

  if (acceptableMethods.includes(data.method)) {
    return users[data.method](data);
  } else {
    return {
      status: StatusCodes.NotAcceptable
    };
  }
});
