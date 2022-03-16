import axios, { AxiosStatic } from 'axios';

import { mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('axios');
const axiosMock = axios as unknown as DeepMockProxy<AxiosStatic>;

beforeEach(() => {
  mockReset(axiosMock);
});

export default axiosMock;
