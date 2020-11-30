export interface QueryProp {
  queryType: 'where' | 'order' | 'take' | 'skip';
  col?: string;
  operator?: 'equal' | 'like' | 'in' | '>=' | '<=' | '>' | '<';
  propName: string;
}

export interface QueryProps {
  [key: string]: QueryProp;
}
