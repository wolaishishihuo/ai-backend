import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * 校验必填参数，过滤 'undefined'、'null' 等无效字符串
 */
@Injectable()
export class ParseRequiredPipe implements PipeTransform<string, string> {
  constructor(private readonly paramName: string = '参数') {}

  transform(value: string): string {
    const invalidValues = ['undefined', 'null', ''];

    if (!value || invalidValues.includes(value.trim().toLowerCase())) {
      throw new BadRequestException(`${this.paramName}不能为空`);
    }

    return value.trim();
  }
}
