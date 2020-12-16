import {CreateDateColumn, UpdateDateColumn} from 'typeorm';

export abstract class CommonModel {
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  protected primaryKey() {
    return 'id';
  }

  public scopeId(query: any, id: any) {
    return query.andWhere(this.constructor.name + '.' + this.primaryKey() + ' = :id', {id: id});
  }

  public scopeIds(query: any, ids: Array<any>) {
    return query.andWhere(this.constructor.name + '.' + this.primaryKey() + ' IN (:...ids)', {ids: ids});
  }

  public scopeExcludeIds(query: any, ids: Array<any>) {
    return query.andWhere(this.constructor.name + '.' + this.primaryKey() + ' NOT IN (:...ids)', {ids: ids});
  }

  public scopeIsActive(query: any, is_active = true) {
    return query.andWhere(this.constructor.name + '.' + 'is_active = :is_active', {is_active: is_active});
  }

  public scopeIsFinished(query: any, is_finished = false) {
    return query.andWhere(this.constructor.name + '.' + 'is_finished = :is_finished', {is_finished: is_finished});
  }

  public scopeStatus(query: any, status: number) {
    return query.andWhere(this.constructor.name + '.' + 'status = :status', {
      status: status,
    });
  }

  public scopeStartDate(query: any, date: string) {
    return query.andWhere(this.constructor.name + '.' + 'created_at >= :start_date', {start_date: date + ' 00:00:00'});
  }

  public scopeEndDate(query: any, date: string) {
    return query.andWhere(this.constructor.name + '.' + 'created_at <= :end_date', {end_date: date + ' 23:59:59'});
  }

  public scopeUpdateStartDate(query: any, date: string) {
    return query.andWhere(this.constructor.name + '.' + 'updated_at >= :update_start_date', {update_start_date: date + ' 00:00:00'});
  }

  public scopeUpdateEndDate(query: any, date: string) {
    return query.andWhere(this.constructor.name + '.' + 'updated_at <= :update_end_date', {update_end_date: date + ' 23:59:59'});
  }

  public scopeOrderByLatest(query: any) {
    return query.addOrderBy(this.constructor.name + '.' + this.primaryKey(), 'DESC');
  }

  public scopeOrderByOldest(query: any) {
    return query.addOrderBy(this.constructor.name + '.' + this.primaryKey(), 'ASC');
  }

  public scopeOrderByLatestUpdate(query: any) {
    return query.addOrderBy(this.constructor.name + '.' + 'updated_at', 'DESC');
  }

  public scopeLastModifiedBy(query: any, id: any) {
    return query.andWhere(this.constructor.name + '.' + 'last_modified_by = :last_modified_by', {last_modified_by: id});
  }

  public scopeLastModifiedById(query: any, id: any) {
    return query.andWhere(this.constructor.name + '.' + 'last_modified_by_id = :last_modified_by_id', {last_modified_by_id: id});
  }
}
