import { BasicList, ListAction, ListContext, ListItem, Neovim } from 'coc.nvim';
import { ApolloConfigFormat } from './apollo';
import { reloadSchema } from './reloadSchema';
import { reloadSchemaVariants } from './reloadSchemaVariants';

export default class ApolloVariantList extends BasicList {
  public readonly name = 'apollo_schema_variants';
  public readonly description = 'CocList for Apollo schema variants';
  public readonly defaultAction = 'open';
  public actions: ListAction[] = [];
  public apolloConfig: ApolloConfigFormat;

  constructor(nvim: Neovim, apolloConfig: ApolloConfigFormat) {
    super(nvim);
    this.apolloConfig = apolloConfig;

    this.addAction('open', (item: ListItem) => {
      reloadSchema(this.apolloConfig, item.data.name);
    });
  }

  public async loadItems(context: ListContext): Promise<ListItem[]> {
    const variants = await reloadSchemaVariants(this.apolloConfig);

    return variants.map((variant) => ({
      label: variant.name,
      data: variant,
    }));
  }
}
