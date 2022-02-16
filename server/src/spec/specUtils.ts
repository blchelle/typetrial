import { expect } from 'chai';

export const expectThrowsAsync = async (method: () => Promise<unknown>, expected: Error) => {
  try {
    await method();
    expect.fail();
  } catch (err: any) {
    // Asserts that the errors are the same type
    expect(err.constructor.name).to.equal(expected.constructor.name);

    // Asserts that all properties are the same
    Object.entries(expected).forEach(([key, value]) => {
      expect(err[key]).to.deep.equal(value);
    });
  }
};
