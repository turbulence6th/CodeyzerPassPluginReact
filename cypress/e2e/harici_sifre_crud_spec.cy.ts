describe('Şifre ekleme testi', () => {

    before(() => {
        cy.login('oguz2', 'oguz2');
    });

    /* it('Şifre ekleme işlemi yapılabilmeli', () => {
      cy.get('.pi-file-edit').click();

      cy.get('#url').type('www.google.com');
      cy.get('#androidPaket').type('com.google.android.googlequicksearchbox');
      cy.get('#kullaniciAdi').type('GOOGLE_KULLANICI_ADI');
      cy.get('#sifre').type('GOOGLE_SIFRE');
      cy.get('#sifreEkleGuncelle').click();

      cy.get('.p-tabview-nav > :nth-child(1)'}).should('have.class', 'p-tabview-selected');
    }); */

    it('Yeni şifre başarıyla kaydedilmeli', () => {
        cy.get('#platformSecenekleri').click();
        cy.get('li').contains('1000kitap.com').click();
        cy.get('#kullaniciAdiSecenekleri').click();
        cy.get('li').contains('otanrikulu').click();
    });
  });