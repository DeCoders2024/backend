% Name Nitin Gupta ; Scholar Number : 20U02019 ; Branch : CSE

% Read The Image
img_1=imread('circles.png');
img_2=imread('circbw.tif');

%SubPlot Object Initialise
 
subplot(3,3,3);

% resize images

img_1=imresize(img_1,[200 200]);
img_2=imresize(img_2,[200 200]);


% and operation

img_and=img_1&img_2;

% or operation

img_or=img_1|img_2;

% compliment

img_1_com=not(img_1);

img_2_com=not(img_2);

% XOR Of Image

img_xor=xor(img_1,img_2);

% NOR Of Image

img_nor=not(img_or);

% Nand of Image

img_nand=not(img_and);

subplot(3,3,1);
imshow(img_1);
title('Original Image 1')

subplot(3,3,2);
imshow(img_2);
title('Original Image 2')

subplot(3,3,3);
imshow(img_and);
title('And Image')

subplot(3,3,4);
imshow(img_or);
title('OR Image')

subplot(3,3,5);
imshow(img_1_com);
title('Not Of First Image');

subplot(3,3,6);
imshow(img_2_com);
title('Not Of Second Image');

subplot(3,3,7);
imshow(img_xor);
title('Xor of Image');

subplot(3,3,8);
imshow(img_nor);
title('Nor Of Images');

subplot(3,3,9);
imshow(img_nand);
title('NAND of Image');