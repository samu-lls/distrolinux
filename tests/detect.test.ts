import { describe, it, expect } from 'vitest';
import { decideLang, countryFromTrace } from '../src/i18n/detect';

describe('decideLang: escolha do idioma do visitante', () => {
  it('escolha salva vence tudo', () => {
    expect(decideLang({ stored: 'pt', country: 'US', navLang: 'en-US' })).toBe('pt');
    expect(decideLang({ stored: 'en', country: 'BR', navLang: 'pt-BR' })).toBe('en');
  });

  it('acesso do Brasil fica em português', () => {
    expect(decideLang({ stored: null, country: 'BR', navLang: 'en-US' })).toBe('pt');
    expect(decideLang({ stored: null, country: 'br', navLang: null })).toBe('pt');
  });

  it('acesso de fora do Brasil vai para inglês', () => {
    for (const c of ['US', 'PT', 'AR', 'DE', 'JP']) {
      expect(decideLang({ stored: null, country: c, navLang: 'pt-BR' })).toBe('en');
    }
  });

  it('sem país, usa o idioma do navegador', () => {
    expect(decideLang({ stored: null, country: null, navLang: 'pt-BR' })).toBe('pt');
    expect(decideLang({ stored: null, country: null, navLang: 'pt-PT' })).toBe('pt');
    expect(decideLang({ stored: null, country: null, navLang: 'en-GB' })).toBe('en');
    expect(decideLang({ stored: null, country: null, navLang: 'es-AR' })).toBe('en');
  });

  it('sem nenhuma informação, português', () => {
    expect(decideLang({ stored: null, country: null, navLang: null })).toBe('pt');
  });

  it('valor salvo inválido é ignorado', () => {
    expect(decideLang({ stored: 'fr', country: 'US', navLang: null })).toBe('en');
    expect(decideLang({ stored: '', country: 'BR', navLang: null })).toBe('pt');
  });
});

describe('countryFromTrace: leitura do /cdn-cgi/trace da Cloudflare', () => {
  const trace = 'fl=123\nh=distrolinux.com.br\nip=203.0.113.1\nts=1730000000\nloc=BR\ntls=TLSv1.3\n';

  it('lê o país', () => {
    expect(countryFromTrace(trace)).toBe('BR');
    expect(countryFromTrace(trace.replace('loc=BR', 'loc=us'))).toBe('US');
  });

  it('resposta sem país, vazia ou HTML (ex.: rodando local) devolve null', () => {
    expect(countryFromTrace('fl=1\nh=x\n')).toBeNull();
    expect(countryFromTrace('')).toBeNull();
    expect(countryFromTrace('<!doctype html><title>404</title>')).toBeNull();
  });

  it('não confunde com outras chaves', () => {
    expect(countryFromTrace('colo=GRU\nxloc=BR\n')).toBeNull();
  });
});

import { donationMethod } from '../src/i18n/detect';

describe('donationMethod: botão de doação', () => {
  it('Brasil → Pix, em qualquer idioma da página', () => {
    expect(donationMethod('BR', 'pt')).toBe('pix');
    expect(donationMethod('BR', 'en')).toBe('pix');
    expect(donationMethod('br', 'en')).toBe('pix');
  });

  it('fora do Brasil → Buy Me a Coffee, em qualquer idioma da página', () => {
    expect(donationMethod('US', 'pt')).toBe('bmc');
    expect(donationMethod('PT', 'en')).toBe('bmc');
  });

  it('sem país conhecido, segue o idioma da página', () => {
    expect(donationMethod(null, 'pt')).toBe('pix');
    expect(donationMethod(null, 'en')).toBe('bmc');
  });
});
