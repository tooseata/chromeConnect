(function() {
  function $(id) {
    return document.getElementById(id);
  }
  
  var tabs = [
    'about',
    'docs',
    'donate'
  ];

  var curTab = 'about';

  function changeTab(tab) {
    $('tab-'+curTab).className = '';
    $('panel-'+curTab).style.display = 'none';
  
    $('tab-'+tab).className = 'down';
    $('panel-'+tab).style.display = '';
  
    curTab = tab;
  
    window.location.hash = tab;
  };

  function addTabListener(tab) {
    $('tab-'+tab).addEventListener('click', function() {
      changeTab(tab);
    });
  }

  function setTabFromHash() {
    var hashTab = window.location.hash.slice(1);
    if (tabs.indexOf && ~tabs.indexOf(hashTab))
      changeTab(hashTab);
  }

  window.addEventListener('load', function() {
    for (var i = 0; i < tabs.length; i++) {
      addTabListener(tabs[i])
    }
  
    setTabFromHash();
  
    window.addEventListener("hashchange", setTabFromHash);
  });
}());