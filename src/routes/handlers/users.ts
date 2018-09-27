import { route, hash } from '../../util';
import { Route } from '../../types';
import { StatusCodes } from '../../server/statuses';
import DataManager from '../../dataLib/data';

interface User {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  tosAgreement: string;
}

const users = {
  async POST(data: Route.Data<User>): Promise<Route.Payload<any>> {
    // Check user fields
    const required = {
      'firstName': 'string',
      'lastName': 'string',
      'password': 'string',
      'phone': 'string',
      'tosAgreement': 'string',
    };

    // Validate payload fields
    for (const key in required) {

      // If some field is undefined or empty - raise missing field error
      if (
        (typeof data.payload[key] === required[key] && !data.payload[key].replace(/\s/g, ''))
        || typeof data.payload[key] === 'undefined'
      ) {
        return {
          status: StatusCodes.BadRequest,
          payload: `Missing required field - ${key}\n`
        };
      }
      // If some field is of wrong type - raise type error
      else if (typeof data.payload[key] !== required[key]) {
        return {
          status: StatusCodes.BadRequest,
          payload: String(new TypeError(`Field type of '${typeof data.payload[key]}' for ${key} is invalid, must be '${required[key]}'\n`))
        };
      }
      // Simply truncate the field otherwise
      else {
        data.payload[key] = data.payload[key].replace(/\s/g, '');
      }
    }

    if (data.payload.phone.length < 10) {
      return {
        status: StatusCodes.BadRequest,
        payload: `Phone must be longer than 9 digits\n`
      };
    }

    try {
      const user = await DataManager.read('users/' + data.payload.phone);
      if (user) {
        return {
          status: StatusCodes.Conflict,
          payload: 'User already exists\n'
        };
      }
    } catch (e) {
      const password = hash(data.payload.password);
    }

    return {
      status: StatusCodes.OK,
      payload: data.payload
    };
  }
};

export default route(async data => {
  const acceptableMethods = Object.keys(users);

  if (acceptableMethods.includes(data.method)) {
    return users[data.method](data);
  } else {

  }

  return {};
});
