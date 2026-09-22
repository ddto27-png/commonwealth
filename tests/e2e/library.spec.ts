import {test,expect} from '@playwright/test';
test('old saves migrate, notes persist, and saved search finds note text',async({page})=>{
  await page.addInitScript(()=>{if(!localStorage.getItem('seeded')){localStorage.setItem('commonwealth-saved','["osmo"]');localStorage.setItem('seeded','yes');}});
  await page.goto('/saved');await expect(page.getByRole('heading',{name:'Osmo',exact:true})).toBeVisible();
  await page.goto('/stories/osmo');await page.getByLabel('Your private note').fill('Reference for my scent installation');
  await page.getByRole('button',{name:'Save idea & note'}).click();await expect(page.getByText('Note saved.',{exact:true})).toBeVisible();
  await page.reload();await expect(page.getByLabel('Your private note')).toHaveValue('Reference for my scent installation');
  await page.getByRole('link',{name:/Saved ideas/}).click();await page.getByRole('searchbox').fill('scent installation');
  await expect(page.getByRole('heading',{name:'Osmo',exact:true})).toBeVisible();
});
test('About owns its navigation state; legacy links still work',async({page})=>{
  await page.goto('/#about');await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('nav [aria-current="page"]')).toHaveText('About');
  await expect(page.getByRole('heading',{level:1})).toContainText('Make something');
});
test('filters survive refresh and a missing story has a real 404',async({page})=>{
  await page.goto('/?category=Technology&theme=Memory#collection');
  await expect(page.getByRole('heading',{name:'Polycam',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Osmo',exact:true})).toHaveCount(0);
  await page.reload();await expect(page.getByRole('button',{name:'Memory',exact:true})).toHaveAttribute('aria-pressed','true');
  const response=await page.goto('/stories/does-not-exist');expect(response?.status()).toBe(404);
});
