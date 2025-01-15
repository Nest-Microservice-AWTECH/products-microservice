import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log(`Database connected`);
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total: totalPages,
        current_page: page,
        last_page: lastPage,
      },
    };
  }

  async findOne(id: number) {
    const productId = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!productId)
      throw new NotFoundException(`Prodcut with id: #${id} not found`);

    return productId;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const productDelete = await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });

    // return this.product.delete({
    //   where: { id },
    // });

    return productDelete;
  }
}
