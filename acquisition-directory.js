(function () {
  'use strict';
  document.querySelectorAll('[data-acquisition-directory]').forEach(root => {
    const search=root.querySelector('[data-acquisition-search]');
    const series=root.querySelector('[data-acquisition-series]');
    const models=[...root.querySelectorAll('[data-acquisition-model]')];
    const normalize=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'');
    const update=()=>{
      const query=normalize(search.value.trim());
      let count=0;
      models.forEach(model=>{
        const match=normalize(model.querySelector('summary').textContent).includes(query) && (!series.value || model.dataset.series===series.value);
        model.hidden=!match;
        if (match) count++;
        model.open=match && !!query;
      });
      root.querySelector('[data-acquisition-count]').textContent=`${count} modelos encontrados`;
      root.querySelector('[data-acquisition-empty]').hidden=count!==0;
    };
    root.querySelector('[data-acquisition-filters]').hidden=false;
    search.addEventListener('input',update);
    series.addEventListener('change',update);
    root.querySelector('[data-acquisition-reset]').addEventListener('click',()=>{search.value='';series.value='';update();search.focus();});
  });
})();
