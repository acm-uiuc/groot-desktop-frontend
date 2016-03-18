/** ConferenceController
    Responsible for content home view
    - Contacts groot for list of ACM events
    - Interfaces with the GROOT API GATEWAY
**/
app.controller('ConferenceCtrl', function ($scope){
    // contact groot-users service
    // TODO: Migrate to groot
    $scope.editions =  [
        {year: '2016', path: '/conference/2016'},
        {year: '2015', path: '/conference/2015'},
        {year: '2014', path: '/conference/2014'},
        {year: '2013', path: '/conference/2013'},
        {year: '2012', path: '/conference/2012'},
        {year: '2011', path: '/conference/2011'},
        {year: '2010', path: '/conference/2010'},
        {year: '2009', path: '/conference/2009'},
        {year: '2008', path: '/conference/2008'},
        {year: '2007', path: '/conference/2007'},
        {year: '2006', path: '/conference/2006'},
        {year: '2005', path: '/conference/2005'},
        {year: '2004', path: '/conference/2004'},
        {year: '2003', path: '/conference/2003'},
        {year: '2002', path: '/conference/2002'},
        {year: '2001', path: '/conference/2001'},
        {year: '2000', path: '/conference/2000'},
        {year: '1999', path: '/conference/1999'},
        {year: '1998', path: '/conference/1998'},
        {year: '1997', path: '/conference/1997'},
        {year: '1996', path: '/conference/1996'},
        {year: '1995', path: '/conference/1995'},
    ];
});
