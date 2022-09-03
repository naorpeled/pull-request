describe('website', () => {
  beforeEach(() => cy.visit('/'));

  it('should display coming soon message', () => {
    cy.get('body').contains('Coming soon...');
  });
});
