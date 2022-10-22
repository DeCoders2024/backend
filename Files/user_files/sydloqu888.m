%IMAGE ARITHMETIC OPERATION USING MATLAB
%%
i1=imread('cameraman.tif');
i2=imread('moon.tif');
i2=imresize(i2,[256,256]);
subplot(3,2,1);
imshow(i1);
title('Original image i1');
subplot(3,2,2);
imshow(i2);
title('Original image i2');
i=i1+i2; %Addition of image i1 and image i2
subplot(3,2,3);
imshow(i);
title('Addition of i1 and i2');

i=i1-i2;
subplot(3,2,4);
imshow(i);
title('Substraction of i1 and i2');

i=(i1.*i2);
subplot(3,2,5);
imshow(i);
title('Multiplication of i1 and i2');

i=i1./i2;
subplot(3,2,6);
imshow(i);
title('Division of i1 and i2');

