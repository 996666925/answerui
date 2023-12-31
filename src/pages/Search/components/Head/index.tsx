import { memo, FC, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { following } from '@/services';
import { tryNormalLogged } from '@/utils/guard';
import { escapeRemove } from '@/utils';
import { pathFactory } from '@/router/pathFactory';
import { PluginRender } from '@/components';

interface Props {
  data;
}

const reg =
  /(\[.*\])|(is:answer)|(is:question)|(score:\d*)|(user:\S*)|(answers:\d*)/g;
const Index: FC<Props> = ({ data }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'search' });
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');
  const options = q?.match(reg);
  const [followed, setFollowed] = useState(data?.is_follower);

  const follow = () => {
    if (!tryNormalLogged(true)) {
      return;
    }
    following({
      object_id: data?.tag_id,
      is_cancel: followed,
    }).then((res) => {
      setFollowed(res.is_followed);
    });
  };

  return (
    <div className="mb-5">
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <h3 className="mb-0">{t('title')}</h3>
        <PluginRender slug_name="algolia" />
      </div>
      <p>
        <span className="text-secondary me-1">{t('keywords')}</span>
        {q?.replace(reg, '')}
        <br />
        {options?.length && (
          <>
            <span className="text-secondary">{t('options')} </span>
            {options?.map((item) => {
              return <code key={item}>{item} </code>;
            })}
          </>
        )}
      </p>
      {data?.slug_name && (
        <>
          {data.excerpt && (
            <p className="text-break">
              {escapeRemove(data.excerpt)}
              <Link className="ms-1" to={pathFactory.tagInfo(data.slug_name)}>
                [{t('more')}]
              </Link>
            </p>
          )}

          <Button variant="outline-primary" onClick={follow}>
            {followed ? t('following') : t('follow')}
          </Button>
        </>
      )}
    </div>
  );
};

export default memo(Index);
