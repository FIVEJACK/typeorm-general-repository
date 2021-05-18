# itemku TypeORM General Repository

General Repository for common tasks and adding query helper in Laravel style

# How to use

## Install

```bash
yarn install @itemku/general-repository
```

## Quickstart

### Extends Model & Add Scope

1.  always extends CommonModel, this will have standard properties on created_at and updated_at also some default scope for searching

```tsx


@Entity()

export  class  TestModel  extends  CommonModel {
.
.
.
}
```

2. Add column & scope for filter , format should be :
   scopeXXXX(query: ProxyQuery<T>, id)
   ex :

```tsx
	public  scopeUserId(query: ProxyQuery<TestModel>, id: number) {{

		return  query.andWhere('user_id = :user_id', { user_id:  id });

	}
```

3. You could also have more than 1 parameter or no parameter at all
   ex :

```tsx
	public  scopeUserActive(query: ProxyQuery<TestModel>) {{

		return  query.andWhere('is_active= :is_active', { is_active:  true});

	}

	public  scopeUserTest(query: ProxyQuery<TestModel>, id1: number, id2: number) {{
		let query = query.andWhere('user_id = :user_id', { user_id:  id1 });
		query = query.andWhere('id_transaction = :id_transaction ', { id_transaction:  id2 });
		return query;
	}
```

### Extends General Repository

1. Extends General Repository

```tsx
export class TestRepository extends GeneralRepository<TestModel> {
  constructor(entity: EntityManager) {
    super(TestModel, entity);
  }
}
```

2. Override Common Filter

```tsx

protected  commonFilter(queryBuilder: ProxyQuery<TestModel>, filter) {

	super.commonFilter(queryBuilder, filter);



	const  userId = getDefault(filter['user_id']);


	if (userId != undefined) {

	queryBuilder = queryBuilder.UserId(userId);

	}


}
```

# API - Standard Scope

This scope already included in CommonModel no need to create again

### 1) scopeId(query: ProxyQuery<CommonModel>, id: any)

if there's any primary key that's different (not ID) you could override primaryKey() and return the correct Primary Key

```tsx
public  scopeId(query: ProxyQuery<CommonModel>, id: any) {

	return  query.andWhere(this.constructor.name + '.' + this.primaryKey() + ' = :id', {id:  id});

}
```

### 2) scopeIds(query: ProxyQuery<CommonModel>, ids: Array<any>)

if there's any primary key that's different (not ID) you could override primaryKey() and return the correct Primary Key

```tsx
public  scopeIds(query: ProxyQuery<CommonModel>, ids: Array<any>) {

	return  query.andWhere(this.constructor.name + '.' + this.primaryKey() + ' IN (:...ids)', {ids:  ids});

}
```

### 3) scopeExcludeIds(query: ProxyQuery<CommonModel>, ids: Array<any>)

if there's any primary key that's different (not ID) you could override primaryKey() and return the correct Primary Key

```tsx
public  scopeExcludeIds(query: ProxyQuery<CommonModel>, ids: Array<any>) {

	return  query.andWhere(this.constructor.name + '.' + this.primaryKey() + ' NOT IN (:...ids)', {ids:  ids});

}
```

### 4) scopeIsActive(query: ProxyQuery<CommonModel>, is_active = true)

```tsx
public  scopeIsActive(query: ProxyQuery<CommonModel>, is_active = true) {

	return  query.andWhere(this.constructor.name + '.' + 'is_active = :is_active', {is_active:  is_active});

}

```

### 5) scopeIsFinished(query: ProxyQuery<CommonModel>, is_finished = false)

```tsx
public  scopeIsFinished(query: ProxyQuery<CommonModel>, is_finished = false) {

	return  query.andWhere(this.constructor.name + '.' + 'is_finished = :is_finished', {is_finished:  	is_finished});

}

```

### 6) scopeStatus(query: ProxyQuery<CommonModel>, is_finished = false)

```tsx
public  scopeStatus(query: ProxyQuery<CommonModel>, status: number) {

	return  query.andWhere(this.constructor.name + '.' + 'status = :status', {status:  status});

}
```

### 7) scopeStartDate(query: ProxyQuery<CommonModel>, date: string)

```tsx
public  scopeStartDate(query: ProxyQuery<CommonModel>, date: string) {

	return  query.andWhere(this.constructor.name + '.' + 'created_at >= :start_date', {start_date:  date + ' 00:00:00'});

}
```

### 8) scopeStartDate(query: ProxyQuery<CommonModel>, date: string)

```tsx
public  scopeStartDate(query: ProxyQuery<CommonModel>, date: string) {

	return  query.andWhere(this.constructor.name + '.' + 'created_at >= :start_date', {start_date:  date + ' 00:00:00'});

}
```

### 9) scopeEndDate(query: ProxyQuery<CommonModel>, date: string)

```tsx
public  scopeEndDate(query: ProxyQuery<CommonModel>, date: string) {

	return  query.andWhere(this.constructor.name + '.' + 'created_at <= :end_date', {end_date:  date + ' 23:59:59'});

}
```

### 10) scopeUpdateStartDate(query: ProxyQuery<CommonModel>, date: string)

```tsx
public  scopeUpdateStartDate(query: ProxyQuery<CommonModel>, date: string) {

	return  query.andWhere(this.constructor.name + '.' + 'updated_at >= :update_start_date', {update_start_date:  date + ' 00:00:00'});

}
```

### 10) scopeUpdateEndDate(query: ProxyQuery<CommonModel>, date: string)

```tsx
public  scopeUpdateEndDate(query: ProxyQuery<CommonModel>, date: string) {

	return  query.andWhere(this.constructor.name + '.' + 'updated_at <= :update_end_date', {update_end_date:  date + ' 23:59:59'});

}
```

### 11) scopeOrderByLatest(query: ProxyQuery<CommonModel>)

```tsx
public  scopeOrderByLatest(query: ProxyQuery<CommonModel>) {

	return  query.addOrderBy(this.constructor.name + '.' + 'created_at', 'DESC');

}
```

### 11) scopeOrderByOldest(query: ProxyQuery<CommonModel>)

```tsx
public  scopeOrderByOldest(query: ProxyQuery<CommonModel>) {

	return  query.addOrderBy(this.constructor.name + '.' + 'created_at', 'ASC');

}

```

### 12) scopeOrderByLatestUpdate(query: ProxyQuery<CommonModel>)

```tsx
public  scopeOrderByLatestUpdate(query: ProxyQuery<CommonModel>) {

	return  query.addOrderBy(this.constructor.name + '.' + 'updated_at', 'DESC');

}

```

### 13) scopeLastModifiedBy(query: ProxyQuery<CommonModel>, id: any)

```tsx
public  scopeLastModifiedBy(query: ProxyQuery<CommonModel>, id: any) {

	return  query.andWhere(this.constructor.name + '.' + 'last_modified_by = :last_modified_by', {last_modified_by:  id});

}

```

### 13) scopeLastModifiedById(query: ProxyQuery<CommonModel>, id: any)

```tsx

public  (query: ProxyQuery<CommonModel>, id: any) {

	return  query.andWhere(this.constructor.name + '.' + 'last_modified_by_id = :last_modified_by_id', {last_modified_by_id:  id});

}


```

## Full Example

### Model

```tsx

@Entity()

export  class  TestModel  extends  CommonModel {

	@PrimaryColumn()

	@Generated()

	id: string;



	@Column()

	user_id: number;



	@Column()

	balance: number;



	@Column()

	withdraw_balance: number;



	public  scopeUserId(query: ProxyQuery<TestModel>, id: number) {{

	return  query.andWhere('user_id = :user_id', { user_id:  id });

	}
}
```

### Repository

```tsx
export class TestRepository extends GeneralRepository<TestModel> {
  constructor(entity: EntityManager) {
    super(TestModel, entity);
  }

  protected commonFilter(queryBuilder: ProxyQuery<TestModel>, filter) {
    super.commonFilter(queryBuilder, filter);

    const userId = getDefault(filter['user_id']);

    if (userId != undefined) {
      queryBuilder = queryBuilder.UserId(userId);
    }
  }
}
```
