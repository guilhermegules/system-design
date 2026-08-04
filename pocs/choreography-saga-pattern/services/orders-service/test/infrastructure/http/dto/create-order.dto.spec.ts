import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from '@infrastructure/http/dto/create-order.dto';

describe('CreateOrderDto', () => {
  const valid = {
    customerId: '550e8400-e29b-41d4-a716-446655440000',
    items: [{ productId: 'p1', quantity: 2, unitPrice: 10.5 }],
  };

  it('accepts a valid payload', async () => {
    const errors = await validate(plainToInstance(CreateOrderDto, valid));
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing customerId', async () => {
    const errors = await validate(
      plainToInstance(CreateOrderDto, { ...valid, customerId: undefined }),
    );
    expect(errors).toHaveLength(1);
  });

  it('rejects an empty items array', async () => {
    const errors = await validate(plainToInstance(CreateOrderDto, { ...valid, items: [] }));
    expect(errors).toHaveLength(1);
  });

  it('rejects an invalid simulate value', async () => {
    const errors = await validate(
      plainToInstance(CreateOrderDto, { ...valid, simulate: 'bogus' }),
    );
    expect(errors).toHaveLength(1);
  });

  it('rejects a non-positive quantity', async () => {
    const errors = await validate(
      plainToInstance(CreateOrderDto, {
        ...valid,
        items: [{ productId: 'p1', quantity: 0, unitPrice: 10.5 }],
      }),
    );
    expect(errors).toHaveLength(1);
  });

  it('rejects a quantity that is not an integer', async () => {
    const errors = await validate(
      plainToInstance(CreateOrderDto, {
        ...valid,
        items: [{ productId: 'p1', quantity: 1.5, unitPrice: 10.5 }],
      }),
    );
    expect(errors).toHaveLength(1);
  });

  it('rejects a negative unitPrice', async () => {
    const errors = await validate(
      plainToInstance(CreateOrderDto, {
        ...valid,
        items: [{ productId: 'p1', quantity: 1, unitPrice: -1 }],
      }),
    );
    expect(errors).toHaveLength(1);
  });
});
