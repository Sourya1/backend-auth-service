import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { Tenent } from '../entity/Tenent';
import { ITenent } from '../types';

export class TenentService {
  constructor(private tenentRepository: Repository<Tenent>) {}

  async create({ name, address }: ITenent) {
    try {
      return await this.tenentRepository.save({ name, address });
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to store the data in database',
      );
      throw error;
    }
  }

  async getTenents() {
    return await this.tenentRepository.find();
  }
  async getTenent(tenentId: number) {
    return await this.tenentRepository.findOne({ where: { id: tenentId } });
  }

  async updateTenent(tenentId: number, tenentData: ITenent) {
    return await this.tenentRepository.update(tenentId, tenentData);
  }

  async deleteById(tenentId: number) {
    return await this.tenentRepository.delete(tenentId);
  }
}
