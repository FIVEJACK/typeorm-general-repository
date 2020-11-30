import { ProxyQuery } from 'repositories/proxy-repository';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class CommonModel {
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  protected primaryKey() {
    return 'id';
  }

  public scopeId(query: ProxyQuery<CommonModel>, id: any) {
    return query.andWhere(
      this.constructor.name + '.' + this.primaryKey() + ' = :id',
      { id: id }
    );
  }

  public scopeIds(query: ProxyQuery<CommonModel>, ids: Array<any>) {
    return query.andWhere(
      this.constructor.name + '.' + this.primaryKey() + ' IN (:...ids)',
      { ids: ids }
    );
  }

  public scopeExcludeIds(query: ProxyQuery<CommonModel>, ids: Array<any>) {
    return query.andWhere(
      this.constructor.name + '.' + this.primaryKey() + ' NOT IN (:...ids)',
      { ids: ids }
    );
  }

  public scopeIsActive(query: ProxyQuery<CommonModel>, is_active = true) {
    return query.andWhere(
      this.constructor.name + '.' + 'is_active = :is_active',
      { is_active: is_active }
    );
  }

  public scopeIsFinished(query: ProxyQuery<CommonModel>, is_finished = false) {
    return query.andWhere(
      this.constructor.name + '.' + 'is_finished = :is_finished',
      { is_finished: is_finished }
    );
  }

  public scopeStatus(query: ProxyQuery<CommonModel>, status: number) {
    return query.andWhere(this.constructor.name + '.' + 'status = :status', {
      status: status,
    });
  }

  public scopeStartDate(query: ProxyQuery<CommonModel>, date: string) {
    return query.andWhere(
      this.constructor.name + '.' + 'created_at >= :start_date',
      { start_date: date + ' 00:00:00' }
    );
  }

  public scopeEndDate(query: ProxyQuery<CommonModel>, date: string) {
    return query.andWhere(
      this.constructor.name + '.' + 'created_at <= :end_date',
      { end_date: date + ' 23:59:59' }
    );
  }

  public scopeUpdateStartDate(query: ProxyQuery<CommonModel>, date: string) {
    return query.andWhere(
      this.constructor.name + '.' + 'updated_at >= :update_start_date',
      { update_start_date: date + ' 00:00:00' }
    );
  }

  public scopeUpdateEndDate(query: ProxyQuery<CommonModel>, date: string) {
    return query.andWhere(
      this.constructor.name + '.' + 'updated_at <= :update_end_date',
      { update_end_date: date + ' 23:59:59' }
    );
  }

  public scopeOrderByLatest(query: ProxyQuery<CommonModel>) {
    return query.addOrderBy(
      this.constructor.name + '.' + this.primaryKey(),
      'DESC'
    );
  }

  public scopeOrderByOldest(query: ProxyQuery<CommonModel>) {
    return query.addOrderBy(
      this.constructor.name + '.' + this.primaryKey(),
      'ASC'
    );
  }

  public scopeOrderByLatestUpdate(query: ProxyQuery<CommonModel>) {
    return query.addOrderBy(this.constructor.name + '.' + 'updated_at', 'DESC');
  }

  public scopeOrderBySequence(query: ProxyQuery<CommonModel>) {
    return query.addOrderBy(
      this.constructor.name + '.' + this.primaryKey(),
      'DESC'
    );
  }

  public scopeLastModifiedBy(query: ProxyQuery<CommonModel>, id: any) {
    return query.andWhere(
      this.constructor.name + '.' + 'last_modified_by = :last_modified_by',
      { last_modified_by: id }
    );
  }

  public scopeLastModifiedById(query: ProxyQuery<CommonModel>, id: any) {
    return query.andWhere(
      this.constructor.name +
        '.' +
        'last_modified_by_id = :last_modified_by_id',
      { last_modified_by_id: id }
    );
  }
}
