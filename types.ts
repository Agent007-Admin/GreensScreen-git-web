/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export interface MediaAsset {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  media: MediaAsset[];
}

export interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface Laureate {
  name: string;
  image: string; // placeholder url
  role: string;
  desc: string;
}