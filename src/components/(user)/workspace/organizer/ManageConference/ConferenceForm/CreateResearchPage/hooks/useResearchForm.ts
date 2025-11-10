import { useState } from 'react';

const useResearchForm = () => {
  const [state, setState] = useState({});

  return { state, setState };
};

export default useResearchForm;